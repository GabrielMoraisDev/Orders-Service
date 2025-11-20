import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from google import genai
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from serviceorders.models import ServiceOrder


# Configurar a API do Gemini
GEMINI_API_KEY = "AIzaSyCUQtN3DnPbuNncU9uUlnXWB3w7XyV4U9Q"
GEMINI_MODEL = "gemini-2.5-flash"
print(f"DEBUG: GEMINI_API_KEY carregada: {'SIM' if GEMINI_API_KEY else 'NÃO'}")

GENAI_CLIENT = None
if GEMINI_API_KEY:
    try:
        GENAI_CLIENT = genai.Client(api_key=GEMINI_API_KEY, http_options={"api_version": "v1"})
        print("DEBUG: Cliente Gemini configurado com sucesso (v1)")
    except Exception as exc:
        print(f"DEBUG: Falha ao configurar cliente Gemini: {exc}")
else:
    print("DEBUG: GEMINI_API_KEY ausente")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Endpoint para processar mensagens do chat com IA.
    A IA ajuda a responder perguntas sobre estimativas de tempo e prazos de tarefas.
    """
    user_message = request.data.get('message', '').strip()
    
    if not user_message:
        return Response(
            {'error': 'Mensagem não pode estar vazia'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not GEMINI_API_KEY or GENAI_CLIENT is None:
        return Response(
            {'error': 'API Key do Gemini não configurada. Adicione GEMINI_API_KEY no arquivo .env'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    try:
        # Coletar estatísticas das ordens de serviço para contexto
        user = request.user
        
        # Estatísticas gerais
        total_orders = ServiceOrder.objects.count()
        user_orders = ServiceOrder.objects.filter(
            Q(from_user=user) | Q(responsible=user)
        )
        
        # Média de dias para conclusão
        completed_orders = ServiceOrder.objects.filter(
            status='closed',
            completion_date__isnull=False
        )
        
        avg_completion_days = 0
        if completed_orders.exists():
            avg_days_list = []
            for order in completed_orders:
                days = (order.completion_date - order.start_date).days
                avg_days_list.append(days)
            avg_completion_days = sum(avg_days_list) / len(avg_days_list)
        
        # Estatísticas por prioridade
        priority_stats = {}
        for priority_code, priority_name in ServiceOrder.PRIORITY_CHOICES:
            priority_orders = completed_orders.filter(priority=priority_code)
            if priority_orders.exists():
                avg_days_list = []
                for order in priority_orders:
                    days = (order.completion_date - order.start_date).days
                    avg_days_list.append(days)
                priority_stats[priority_name] = sum(avg_days_list) / len(avg_days_list)
        
        # Ordens em atraso
        delayed_orders = ServiceOrder.objects.filter(
            status='open',
            predicted_date__lt=datetime.now().date()
        ).count()
        
        # Criar contexto para a IA
        context = f"""
Você é um assistente de IA especializado em análise de ordens de serviço e estimativas de tempo.

DADOS DO SISTEMA:
- Total de ordens de serviço: {total_orders}
- Ordens do usuário atual: {user_orders.count()}
- Ordens concluídas no sistema: {completed_orders.count()}
- Média geral de dias para conclusão: {avg_completion_days:.1f} dias
- Ordens em atraso: {delayed_orders}

ESTATÍSTICAS POR PRIORIDADE:
{json.dumps(priority_stats, indent=2, ensure_ascii=False)}

INSTRUÇÕES:
- Responda perguntas sobre estimativas de tempo, prazos e análise de ordens de serviço
- Use os dados acima para fundamentar suas respostas
- Seja específico e prático
- Se não tiver dados suficientes, estime o tempo da melhor forma possível
- Mantenha respostas concisas e objetivas
- Responda em português brasileiro
- Mesmo que impreciso, forneça a melhor estimativa possível
- Trocar uma lâmpada leva em média 15 minutos

PERGUNTA DO USUÁRIO:
{user_message}
"""
        
        # Chamar a API do Gemini
        response = GENAI_CLIENT.models.generate_content(
            model=GEMINI_MODEL,
            contents=context
        )

        ai_response = getattr(response, 'text', None) or getattr(response, 'output_text', '')
        if not ai_response:
            raise ValueError('Resposta do Gemini vazia')
        
        return Response({
            'message': user_message,
            'response': ai_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erro ao processar mensagem: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

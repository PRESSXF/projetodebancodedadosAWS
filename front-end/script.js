// =========================================================================
// !!! SUBSTITUA AQUI PELO SEU ENDPOINT REAL DO API GATEWAY (SAÍDA DA AWS) !!!
// =========================================================================
const API_ENDPOINT_BASE = "[COLE O SEU ENDPOINT AQUI]"; // Ex: https://xxx.execute-api.sa-east-1.amazonaws.com/Prod

document.getElementById('endpointDisplay').textContent = API_ENDPOINT_BASE;

function displayResult(status, message, shortUrl = null) {
    const resultadoDiv = document.getElementById('resultado');
    const statusMessage = document.getElementById('statusMessage');
    const shortUrlLink = document.getElementById('shortUrlLink');

    resultadoDiv.style.display = 'block';
    
    // Limpa classes anteriores
    statusMessage.className = '';
    shortUrlLink.textContent = '';
    shortUrlLink.href = '#';

    if (status === 'SUCESSO') {
        statusMessage.textContent = 'SUCESSO! O link foi criado e está pronto para uso.';
        statusMessage.classList.add('success');
        shortUrlLink.textContent = shortUrl;
        shortUrlLink.href = shortUrl;

        // Limpa o campo de entrada para nova URL
        document.getElementById('longUrlInput').value = ''; 
    } else {
        statusMessage.textContent = `FALHA: ${message}`;
        statusMessage.classList.add('error');
    }
}

async function encurtarUrl() {
    const longUrl = document.getElementById('longUrlInput').value;

    if (!longUrl) {
        alert("Por favor, insira uma URL longa.");
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINT_BASE}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ long_url: longUrl }),
        });

        const data = await response.json();

        if (response.ok) {
            displayResult('SUCESSO', 'URL criada com sucesso.', data.short_url);
        } else {
            // Se a API retornar um erro (ex: 400 Bad Request)
            const errorMessage = data.message || 'Erro desconhecido ao processar a requisição.';
            displayResult('FALHA', errorMessage);
        }

    } catch (error) {
        // Erro de rede ou CORS
        console.error('Erro de conexão:', error);
        displayResult('FALHA', 'Não foi possível conectar ao API Gateway. Verifique o console ou a configuração CORS.');
    }
}
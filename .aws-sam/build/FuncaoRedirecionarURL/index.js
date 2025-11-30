const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.URL_TABLE_NAME;

exports.handler = async (event) => {
    try {
        // Pega o código curto da URL (ex: "abc123" em seu-api.com/Prod/abc123)
        const shortCode = event.pathParameters.short_code;

        const params = {
            TableName: TABLE_NAME,
            Key: {
                short_code: shortCode,
            }
        };

        const data = await dynamoDb.get(params).promise();

        if (data.Item) {
            // Se a URL original for encontrada, executa o redirecionamento 302
            const longUrl = data.Item.long_url;
            return {
                statusCode: 302,
                headers: {
                    // O cabeçalho 'Location' é o que faz o navegador redirecionar
                    'Location': longUrl, 
                },
                body: ''
            };
        } else {
            // Se não encontrar o código, retorna erro
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Código curto ${shortCode} não encontrado.` }),
            };
        }

    } catch (error) {
        console.error('Erro ao redirecionar:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor' }),
        };
    }
};
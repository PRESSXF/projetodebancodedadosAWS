const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.URL_TABLE_NAME;

// Função para gerar um código alfanumérico aleatório de 6 caracteres
const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const longUrl = body.long_url;

        if (!longUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'O campo long_url é obrigatório.' }),
            };
        }

        const shortCode = generateShortCode();
        
        const params = {
            TableName: TABLE_NAME,
            Item: {
                short_code: shortCode, 
                long_url: longUrl,
                createdAt: new Date().toISOString() 
            }
        };

        await dynamoDb.put(params).promise();

        // Monta o URL completo para o usuário testar
        const apiUrlBase = `https://${event.headers.Host}/${event.requestContext.stage}`;
        const shortUrl = `${apiUrlBase}/${shortCode}`;

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                short_url: shortUrl,
                original_url: longUrl
            }),
        };

    } catch (error) {
        console.error('Erro ao criar URL curta:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
        };
    }
};
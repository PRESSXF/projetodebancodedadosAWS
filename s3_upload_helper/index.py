# s3_upload_helper/index.py

import cfnresponse
import boto3
import json
import os
import shutil
from pathlib import Path

s3_client = boto3.client('s3')

def get_content_type(file_name):
    """Determina o ContentType para o S3."""
    if file_name.endswith('.html'):
        return 'text/html'
    if file_name.endswith('.js'):
        return 'application/javascript'
    if file_name.endswith('.css'):
        return 'text/css'
    return 'binary/octet-stream' # Default

def handler(event, context):
    try:
        if event['RequestType'] == 'Delete':
            # Nenhuma ação de limpeza de arquivos é necessária no Delete
            cfnresponse.send(event, context, cfnresponse.SUCCESS, {})
            return

        bucket_name = event['ResourceProperties']['BucketName']
        # source_folder = 'frontend' (passado pelo CloudFormation)
        source_folder = event['ResourceProperties']['SourceFolder'] 
        replacements = event['ResourceProperties'].get('Replacements', [])
        
        # Cria e limpa uma pasta temporária para trabalhar
        temp_dir = '/tmp/upload_temp'
        shutil.rmtree(temp_dir, ignore_errors=True)
        Path(temp_dir).mkdir(parents=True, exist_ok=True)
        
        # Processa cada arquivo
        for file_info in event['ResourceProperties']['FilesToUpload']:
            file_name = file_info['file']
            
            # CORRIGIDO: Constrói o caminho de origem. Usa '.' como raiz (/var/task/)
            source_path = os.path.join('.', source_folder, file_name) 
            
            target_path = os.path.join(temp_dir, file_name)

            # Copia o arquivo para a pasta temporária
            shutil.copyfile(source_path, target_path)

            # Aplica substituições (Placeholder do Endpoint)
            for r in replacements:
                if r['file'] == file_name:
                    print(f"Aplicando substituição em: {file_name}")
                    with open(target_path, 'r') as f:
                        content = f.read()
                    
                    content = content.replace(r['placeholder'], r['value'])

                    with open(target_path, 'w') as f:
                        f.write(content)
                        
            # Faz o upload para o S3
            content_type = get_content_type(file_name)
            
            print(f"Fazendo upload de {file_name} com ContentType: {content_type}")
            
            s3_client.upload_file(
                Filename=target_path, 
                Bucket=bucket_name, 
                Key=file_name, # Salva na raiz do bucket
                ExtraArgs={'ContentType': content_type}
            )

        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})

    except Exception as e:
        print(f"Erro no S3 Uploader: {e}")
        # Garante que a razão do erro seja incluída na resposta do CloudFormation
        cfnresponse.send(event, context, cfnresponse.FAILED, {'Reason': str(e)}, reason=f"S3 Upload Error: {str(e)}")
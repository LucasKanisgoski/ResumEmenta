This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# resumEmenta - Guia para Avaliadores

> Este documento contém as instruções necessárias para configurar e executar o aplicativo resumEmenta localmente.

## Sobre o Aplicativo

* resumEmenta é um aplicativo mobile desenvolvido em React Native que utiliza a inteligência artificial do modelo Gemini 2.0 Flash para simplificar textos jurídicos, como ementas e decisões judiciais, para o público leigo. O aplicativo aceita três tipos de entrada:

* Texto: O usuário pode colar um texto diretamente na caixa de entrada.

* Imagem: O usuário pode selecionar uma imagem contendo texto jurídico (ex: um screenshot de uma decisão).

## Configuração da API da Gemini

Para que o aplicativo funcione, é necessário gerar uma chave de API e configurá-la no projeto.

### 1. Gerar sua Chave da API

1. Acesse o site do Google AI Studio para gerar a sua chave de API:
https://aistudio.google.com/app/apikey

2. Clique em "Create API key in new project".

3. Copie a chave gerada.

### 2. Configurar a Chave no Projeto

1. Na raiz do projeto, existe um arquivo chamado .env.

Dentro deste arquivo, adicione a chave que você copiou, seguindo este formato:

GEMINI_API_KEY="SUA_CHAVE_DA_API_AQUI"

Certifique-se de substituir "SUA_CHAVE_DA_API_AQUI" pela sua chave real, incluindo as aspas duplas.

O projeto utiliza a biblioteca react-native-dotenv para acessar essa chave com segurança.

## 3. URL da API

A URL da API para o modelo Gemini já está configurada no código. Ela está definida no arquivo App.tsx com o seguinte valor:

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

Instruções para Execução do Projeto

Após configurar a chave da API, siga os passos abaixo para executar o aplicativo:

## 1. Instalar as dependências:

npm install

## 2. Executar o aplicativo:
    
    Android:
    
    npx react-native run-android

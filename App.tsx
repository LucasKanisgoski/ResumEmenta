import React, { useState } from 'react';
import {
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
    ScrollView,
    Keyboard,
    Image,
} from 'react-native';
import axios from 'axios';
import { GEMINI_API_KEY } from '@env';
import { styles } from './styles';

import { launchImageLibrary } from 'react-native-image-picker';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

const promptEspecializado = (input: string, isImage: boolean) => {
    if (isImage) {
        return `
            Você é um assistente jurídico especializado em simplificar textos complexos para o público leigo, com base no direito brasileiro. Sua tarefa é analisar o texto presente em uma imagem de uma ementa ou decisão judicial e gerar um resumo extremamente conciso, focado nos pontos essenciais, em formato de tópicos.
  
            Primeiro, **extraia todo o texto relevante da imagem**. Se houver informações como "Here are the bounding box detections:", ignore essa parte e foque no texto jurídico propriamente dito.
  
            Se o texto extraído não for uma ementa ou decisão judicial válida, responda apenas com a seguinte frase: "O texto encontrado na imagem não parece ser uma ementa ou decisão judicial válida. Por favor, forneça uma imagem contendo texto jurídico para que eu possa gerar o resumo."
  
            Caso contrário, siga este formato para o resumo, usando frases curtas e diretas:
            - **Tema Principal:** [frase curta e direta sobre o assunto principal]
            - **Decisão do Tribunal:** [frase curta explicando o veredito ou entendimento do tribunal]
            - **O que isso significa para você:** [frase curta e prática, sem juridiquês, explicando as implicações da decisão]
            
            Substitua jargões jurídicos por explicações simples e diretas. Por exemplo, em vez de "honorários de sucumbência", use "as custas que a parte perdedora paga para o advogado da parte vencedora".
            O texto a ser analisado é: "${input}"
        `;
    } else {
        return `
            Você é um assistente jurídico especializado em simplificar textos complexos para o público leigo, com base no direito brasileiro. Sua tarefa é analisar o texto de uma ementa ou decisão judicial e gerar um resumo extremamente conciso, focado nos pontos essenciais, em formato de tópicos.
  
            Se o texto fornecido não for uma ementa ou decisão judicial válida, responda apenas com a seguinte frase: "O texto fornecido não é uma ementa ou decisão judicial válida. Por favor, forneça um texto jurídico para que eu possa gerar o resumo."
  
            Siga este formato para o resumo, usando frases curtas e diretas:
            - **Tema Principal:** [frase curta e direta sobre o assunto principal]
            - **Decisão do Tribunal:** [frase curta explicando o veredito ou entendimento do tribunal]
            - **O que isso significa para você:** [frase curta e prática, sem juridiquês, explicando as implicações da decisão]
            
            Substitua jargões jurídicos por explicações simples e diretas. Por exemplo, em vez de "honorários de sucumbência", use "as custas que a parte perdedora paga para o advogado da parte vencedora".
            O texto a ser analisado é: "${input}"
        `;
    }
};

type TextPart = {
    text: string;
};

type ImagePart = {
    inline_data: {
        mime_type: string;
        data: string;
    };
};

function App(): React.JSX.Element {
    const [ementaText, setEmentaText] = useState('');
    const [resumo, setResumo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const handleSummarize = async () => {
        if (!ementaText && !imageUri) {
            Alert.alert('Erro', 'Por favor, insira o texto da ementa ou selecione uma imagem para resumir.');
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setResumo('');

        try {
            const parts: (TextPart | ImagePart)[] = [];

            const isImage = !!imageUri;
            const inputData = ementaText || '';

            if (isImage) {
                parts.push({ text: promptEspecializado(inputData, true) });
                if (imageUri) {
                    const imagePart = {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: imageUri,
                        },
                    };
                    parts.push(imagePart);
                }
            } else {
                parts.push({ text: promptEspecializado(inputData, false) });
            }

            const requestBody = {
                contents: [{ parts }],
            };

            const response = await axios.post(GEMINI_API_URL, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    key: GEMINI_API_KEY
                }
            });

            const generatedText = response.data.candidates[0].content.parts[0].text;
            setResumo(generatedText);

        } catch (error: any) {
            console.error('Erro ao chamar a API da Gemini:', error);
            if (error.response) {
                console.error('Detalhes do Erro da API:', error.response.data);
                console.error('Status do Erro:', error.response.status);
            }
            Alert.alert('Erro', 'Houve um problema ao tentar resumir. Verifique sua chave de API e a conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearText = () => {
        setEmentaText('');
        setResumo('');
        setImageUri(null);
    };

    const handleImagePicker = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true });
            if (result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                if (image.base64) {
                    setImageUri(image.base64);
                }
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>resumEmenta</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Cole aqui o texto da ementa ou deixe em branco para resumir a imagem."
                    value={ementaText}
                    onChangeText={setEmentaText}
                />
                {ementaText.length > 0 && (
                    <TouchableOpacity onPress={handleClearText} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>X</Text>
                    </TouchableOpacity>
                )}
            </View>

            {imageUri && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: `data:image/jpeg;base64,${imageUri}` }} style={styles.imagePreview} />
                </View>
            )}

            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
                <Text style={styles.imageButtonText}>Selecionar Imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSummarize}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Resumir</Text>
                )}
            </TouchableOpacity>

            <ScrollView style={styles.resumoContainer}>
                {resumo ? (
                    <Text style={styles.resumoText}>{resumo}</Text>
                ) : (
                    <Text style={styles.placeholderText}>O resumo aparecerá aqui.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

export default App;
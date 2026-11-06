import { Book, ReviewSection } from '../types'

const GEMINI_API_KEY_STORAGE = 'gemini_api_key'
const DEFAULT_MODEL = 'gemini-1.5-flash'

export function getStoredApiKey(): string {
  try {
    const fromStorage = localStorage.getItem(GEMINI_API_KEY_STORAGE)
    if (fromStorage && fromStorage.trim()) {
      return fromStorage.trim()
    }
  } catch (e) {
    console.warn('Erro ao ler API key do localStorage:', e)
  }

  return import.meta.env.VITE_GEMINI_API_KEY || ''
}

export function saveStoredApiKey(key: string): void {
  const trimmed = key.trim()
  if (trimmed) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, trimmed)
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE)
  }
}

export function buildReviewPrompt(book: Book, tone: string = 'analitico'): string {
  const authorsStr = book.authors.join(', ')
  const categoriesStr = book.categories && book.categories.length > 0 ? book.categories.join(', ') : 'Geral'

  return `Você é um Crítico Literário Especialista de renome e consultor de escrita literária.
Sua missão é produzir uma resenha crítica aprofundada, elegante e perspicaz sobre o livro informado, servindo como padrão de referência analítica para outro escritor.

INFORMAÇÕES VERIFICADAS DA OBRA (GROUNDING FACTUAL):
- Título: ${book.title}
- Autor(es): ${authorsStr}
- Ano de Publicação: ${book.publishedYear}
- Gêneros/Categorias: ${categoriesStr}
- Sinopse Factual da API: ${book.description}

DIRETRIZES DA RESENHA:
1. Tom desejado: ${tone.toUpperCase()} (rigoroso, embasado, sem superficialidades de marketing).
2. Não faça resumos vazios ou genéricos. Conecte as decisões narrativas com os temas centrais e o contexto do autor.
3. Evite spoilers irrelevantes que arruínem o clímax, mas analise o arco dramático com propriedade crítica.
4. Estruture sua resposta rigorosamente utilizando os títulos de seção abaixo:

## 1. Visão Geral & Premissa
Apresente a proposta do livro, o cenário em que a narrativa ou tese se constrói e a relevância da obra.

## 2. Análise Temática & Subtexto
Explore os temas centrais, as camadas simbólicas e os dilemas morais/filosóficos trabalhados pelo autor.

## 3. Estilo Narrativo & Ritmo
Analise a prosa, a voz narrativa, o ritmo do desenvolvimento, a construção de personagens e as escolhas de linguagem.

## 4. Pontos Fortes & Limitações Críticas
Destaque com honestidade o que a obra tem de mais brilhante e onde ela eventualmente tropeça, peca por excesso ou deixa a desejar.

## 5. Veredito Crítico & Recomendações
Sintetize a importância da obra, para que tipo de leitor ela é indispensável e qual o seu legado literário.`
}

export function parseReviewSections(fullText: string): ReviewSection[] {
  const sections: ReviewSection[] = []
  const sectionRegex = /##\s*(\d\.\s*[^#\n]+)\n([\s\S]*?)(?=(##\s*\d\.\s*[^#\n]+|$))/g

  let match
  while ((match = sectionRegex.exec(fullText)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim(),
    })
  }

  // Se não conseguiu parsear pelas tags ##, retorna como bloco único
  if (sections.length === 0 && fullText.trim()) {
    sections.push({
      title: 'Resenha Completa',
      content: fullText.trim(),
    })
  }

  return sections
}

export async function generateReviewStream(
  book: Book,
  tone: string = 'analitico',
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = getStoredApiKey()
  if (!apiKey) {
    onError(
      new Error(
        'Chave da API do Gemini não configurada. Insira sua chave nas Configurações da aplicação.'
      )
    )
    return
  }

  const prompt = buildReviewPrompt(book, tone)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2500,
        },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`Erro na API do Gemini (HTTP ${response.status}): ${errBody}`)
    }

    if (!response.body) {
      throw new Error('Resposta sem corpo de streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim()
          if (!jsonStr || jsonStr === '[DONE]') continue

          try {
            const data = JSON.parse(jsonStr)
            const textChunk =
              data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (textChunk) {
              fullText += textChunk
              onChunk(textChunk)
            }
          } catch (e) {
            // Ignora fragmento JSON incompleto no buffer
          }
        }
      }
    }

    onComplete(fullText)
  } catch (err: any) {
    console.error('Falha ao gerar resenha via streaming:', err)
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

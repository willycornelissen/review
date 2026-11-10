import { describe, it, expect } from 'vitest'
import { buildReviewPrompt, parseReviewSections } from '../services/reviewAgent'
import { Book } from '../types'

describe('reviewAgent service', () => {
  const mockBook: Book = {
    id: '1',
    title: 'O Ensaio sobre a Cegueira',
    authors: ['José Saramago'],
    publishedYear: '1995',
    description: 'Epidemia de cegueira branca atinge uma cidade.',
    categories: ['Ficção', 'Romance Filosófico'],
  }

  it('constrói o prompt contendo as informações factuais do livro', () => {
    const prompt = buildReviewPrompt(mockBook, 'critico')
    expect(prompt).toContain('O Ensaio sobre a Cegueira')
    expect(prompt).toContain('José Saramago')
    expect(prompt).toContain('1995')
    expect(prompt).toContain('CRITICO')
    expect(prompt).toContain('## 1. Visão Geral & Premissa')
    expect(prompt).toContain('## 5. Veredito Crítico & Recomendações')
  })

  it('faz o parse das 5 seções estruturadas da resenha corretamente', () => {
    const sampleOutput = `
## 1. Visão Geral & Premissa
Uma premissa impactante sobre a fragilidade da civilização.

## 2. Análise Temática & Subtexto
O individualismo e a degradação das relações sociais.

## 3. Estilo Narrativo & Ritmo
Pontuação heterodoxa típica de Saramago, fluxo contínuo de pensamentos.

## 4. Pontos Fortes & Limitações Críticas
Força alegórica incomparável; leitura por vezes densa e asfixiante.

## 5. Veredito Crítico & Recomendações
Obra-prima indispensável para quem estuda prosa contemporânea.
`

    const sections = parseReviewSections(sampleOutput)
    expect(sections).toHaveLength(5)
    expect(sections[0].title).toBe('1. Visão Geral & Premissa')
    expect(sections[0].content).toContain('Uma premissa impactante')
    expect(sections[4].title).toBe('5. Veredito Crítico & Recomendações')
    expect(sections[4].content).toContain('Obra-prima indispensável')
  })

  it('constrói o prompt estruturado com as 4 perguntas de Mortimer Adler quando ativado', () => {
    const prompt = buildReviewPrompt(mockBook, 'academico', true)
    expect(prompt).toContain('O Ensaio sobre a Cegueira')
    expect(prompt).toContain('ACADEMICO')
    expect(prompt).toContain('Mortimer J. Adler')
    expect(prompt).toContain('## 1. Sobre o que é o livro como um todo?')
    expect(prompt).toContain('## 2. O que exatamente está sendo dito, e como?')
    expect(prompt).toContain('## 3. O livro é verdadeiro, no todo ou em parte?')
    expect(prompt).toContain('## 4. O que se segue disso? (E daí?)')
    expect(prompt).not.toContain('## 5.')
  })

  it('faz o parse das 4 seções da Leitura Analítica de Mortimer Adler corretamente', () => {
    const adlerOutput = `
## 1. Sobre o que é o livro como um todo?
Trata-se de uma parábola alegórica sobre a perda da lucidez e da solidariedade humana.

## 2. O que exatamente está sendo dito, e como?
Saramago estabelece a cegueira branca como metáfora da indiferença moral, utilizando diálogos embutidos.

## 3. O livro é verdadeiro, no todo ou em parte?
A obra é psicologicamente verossímil e demonstra com coerência a fragilidade dos pactos sociais.

## 4. O que se segue disso? (E daí?)
Provoca no leitor o dever ético de manter a vigilância moral e a empatia ativa na convivência social.
`

    const sections = parseReviewSections(adlerOutput)
    expect(sections).toHaveLength(4)
    expect(sections[0].title).toBe('1. Sobre o que é o livro como um todo?')
    expect(sections[0].content).toContain('Trata-se de uma parábola')
    expect(sections[1].title).toBe('2. O que exatamente está sendo dito, e como?')
    expect(sections[2].title).toBe('3. O livro é verdadeiro, no todo ou em parte?')
    expect(sections[3].title).toBe('4. O que se segue disso? (E daí?)')
    expect(sections[3].content).toContain('dever ético de manter a vigilância')
  })
})

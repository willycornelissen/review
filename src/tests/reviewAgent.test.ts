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
})

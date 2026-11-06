import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveReview,
  getReviews,
  deleteReview,
  isFirebaseConfigured,
} from '../services/firebase'
import { BookReview } from '../types'

describe('firebase service (fallback offline / local)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('inicia sem configuração do Firebase por padrão se não houver variáveis', () => {
    expect(isFirebaseConfigured()).toBe(false)
  })

  it('salva e recupera resenha no cache local com sucesso', async () => {
    const mockReview: BookReview = {
      id: 'rev-1',
      bookId: 'b-1',
      bookTitle: 'Memórias Póstumas de Brás Cubas',
      bookAuthors: ['Machado de Assis'],
      fullText: 'Resenha brilhante sobre ironia e pessimismo.',
      sections: [
        {
          title: 'Visão Geral',
          content: 'Narrador defunto.',
        },
      ],
      createdAt: new Date().toISOString(),
    }

    await saveReview(mockReview)
    const reviews = await getReviews()
    expect(reviews).toHaveLength(1)
    expect(reviews[0].bookTitle).toBe('Memórias Póstumas de Brás Cubas')
  })

  it('deleta resenha do cache local', async () => {
    const mockReview: BookReview = {
      id: 'rev-2',
      bookId: 'b-2',
      bookTitle: 'Capitães da Areia',
      bookAuthors: ['Jorge Amado'],
      fullText: 'Texto sobre os meninos de rua da Bahia.',
      sections: [],
      createdAt: new Date().toISOString(),
    }

    await saveReview(mockReview)
    let reviews = await getReviews()
    expect(reviews).toHaveLength(1)

    await deleteReview('rev-2')
    reviews = await getReviews()
    expect(reviews).toHaveLength(0)
  })
})

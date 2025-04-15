import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=';

export async function fetchBookData(bookName) {
    try {
        const response = await axios.get(`${GOOGLE_BOOKS_API}${encodeURIComponent(bookName)}`);
        const items = response.data.items || [];

        if (!items.length) return null;

        // Filtrar livros cujo título realmente bate com a busca
        const matchingBooks = items.filter(item => {
            const volumeTitle = item.volumeInfo?.title?.toLowerCase() || '';
            return volumeTitle.includes(bookName.toLowerCase());
        });

        if (!matchingBooks.length) return null;

        const book = matchingBooks[0].volumeInfo;

        return {
            title: book.title || '',
            authors: book.authors ? book.authors.join(', ') : '',
            genres: book.categories ? book.categories.join(', ') : '',
            description: book.description || '',
            pageCount: Number.isInteger(book.pageCount) ? book.pageCount : 0,
            images: matchingBooks
                .map(item => item.volumeInfo?.imageLinks?.thumbnail)
                .filter(Boolean)
        };

    } catch (error) {
        console.error('Erro ao buscar dados do livro:', error);
        return null;
    }
}

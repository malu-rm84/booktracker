import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=';
const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json?q=';

export async function fetchBookData(bookName) {
    try {
        // Busca paralela nas duas APIs
        const [googleResponse, openLibraryResponse] = await Promise.allSettled([
            axios.get(`${GOOGLE_BOOKS_API}${encodeURIComponent(bookName)}`),
            axios.get(`${OPEN_LIBRARY_API}${encodeURIComponent(bookName)}&limit=5`)
        ]);

        const googleBooks = googleResponse.value?.data?.items || [];
        const openLibraryBooks = openLibraryResponse.value?.data?.docs || [];

        // Processa resultados do Google Books
        const matchingGoogleBooks = googleBooks.filter(item => {
            const volumeTitle = item.volumeInfo?.title?.toLowerCase() || '';
            return volumeTitle.includes(bookName.toLowerCase());
        });

        // Coleta capas de ambas as fontes
        const googleCovers = matchingGoogleBooks
            .map(item => item.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://'))
            .filter(Boolean);

        const openLibraryCovers = openLibraryBooks
            .map(book => book.cover_edition_key 
                ? `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg` 
                : null)
            .filter(Boolean);

        // Combina e remove capas duplicadas
        const combinedCovers = [...new Set([...googleCovers, ...openLibraryCovers])];

        // Mantém dados principais do primeiro livro correspondente do Google
        const mainBook = matchingGoogleBooks[0]?.volumeInfo || {};

        return {
            title: mainBook.title || '',
            authors: mainBook.authors ? mainBook.authors.join(', ') : '',
            genres: mainBook.categories ? mainBook.categories.slice(0, 5).join(', ') : '',
            description: mainBook.description || '',
            pageCount: Number.isInteger(mainBook.pageCount) ? mainBook.pageCount : null,
            averageRating: mainBook.averageRating || 0,
            images: combinedCovers
        };

    } catch (error) {
        console.error('Erro ao buscar dados do livro:', error);
        return null;
    }
}
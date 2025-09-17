import {Client,Databases, ID, Query} from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const END_POINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(END_POINT)
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm,movie) => {

    try {
        const result = await databases.getDocument({
            databaseId: DATABASE_ID,
            collectionId: 'metrics',
            documentId: '',
            queries: [
                Query.equal('movie_id',movie.id),
            ] 
        });
        
        console.log(result);

        if(result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument({
                databaseId: DATABASE_ID,
                collectionId: 'metrics',
                documentId: doc.$id,
                data: {
                    count : doc.count + 1,
                }, // optional
            });
        }else {
            await databases.createDocument({
                databaseId: DATABASE_ID,
                collectionId: 'metrics',
                documentId: ID.unique(),
                data: {
                    searchTerm,
                    count : 1,
                    movie_id : movie.id,
                    title : movie.title,
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                },
            });
        }
    } catch (error) {
        console.log(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await databases.getDocument({
            databaseId: DATABASE_ID,
            collectionId: 'metrics',
            documentId: '',
            queries: [
                Query.limit(5),
                Query.orderDesc('count')
            ] 
        });

        return result.documents;
    } catch (error) {
        console.log(error);
        return [];
    }
}
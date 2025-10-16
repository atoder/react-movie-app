import { Client, Databases, ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const MOVIE_API_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;



const client = new Client()
  .setEndpoint(MOVIE_API_ENDPOINT)
  .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  //console.log(PROJECT_ID, DATABASE_ID, COLLECTION_ID);
  console.log("Attempting to update search count for:", searchTerm);

  // 1. Use Appwrite SDK to check if the search term is in the database
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID,
      [Query.equal('searchTerm', searchTerm),]
    )

    // 2a. If it does exist, update the count
    if (result.documents.length > 0) {
      const doc = result.documents[0]
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1
      })
    } else{

      // 2b. If it doesn't exist, create a new document with the search term and count as 1
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        })
    }

  } catch (error) {
    console.error("Failed to update search count in Appwrite:", error);
  }
}

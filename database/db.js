import {getDatabase} from "firebase/database";
import {initializeApp} from "firebase/database"

const firebaseConfig = {
    apiKey: "AIzaSyC9i4I3xV_Kttku82BeOHQnYKGjh2uGB1Y",
    authDomain: "https://react-http-662b7-default-rtdb.firebaseio.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "react-http-662b7",
};

const dbApp = initializeApp(firebaseConfig);

export const db = getDatabase(dbApp);
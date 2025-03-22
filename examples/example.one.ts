import { createDataService, createFileReader, createJsonFormatter } from '../src/data';

// Define your data type
interface User {
    id: number;
    name: string;
    email: string;
}

// Create a file reader
const reader = createFileReader<User>({
    path: './data/users.json',
    encoding: 'utf-8'
});

// Create a JSON formatter
const formatter = createJsonFormatter<User>({
    pretty: true
});

// Create the service
const service = createDataService<User>(reader, formatter);


(async () => {
    const users = await service.read(
        { type: 'file', location: 'users.json' },
        { type: 'json' }
    );
    console.log(users);
})();
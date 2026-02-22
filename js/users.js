// users.js - User accounts and program registry

// Built-in programs
const BUILTIN_PROGRAMS = {
    'anastasia_default': {
        name: 'Анастасия Добросол',
        description: '12-недельная программа',
        athlete: 'Anastasiia Dobrosol',
        getProgram: function() { return DEFAULT_PROGRAM; }
    },
    'mikhail_default': {
        name: 'Дима',
        description: '12-недельная предсоревновательная',
        athlete: 'Mikhail Timoshin',
        getProgram: function() { return MIKHAIL_PROGRAM; }
    }
};

// User accounts (login/password)
// To add a new user: add an entry here + optionally add their program
const ACCOUNTS = [
    { id: 'anastasia', login: 'nastya', password: '1234', name: 'Анастасия', programId: 'anastasia_default' },
    { id: 'mikhail',   login: 'misha',  password: '1234', name: 'Дима',       programId: 'mikhail_default' }
];

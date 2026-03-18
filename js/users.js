// users.js - User accounts and program registry
import { DEFAULT_PROGRAM } from './data.js';
import { MIKHAIL_PROGRAM } from './mikhail_data.js';
import { MIKHAIL2_PROGRAM } from './mikhail2_data.js';

// Built-in programs
export const BUILTIN_PROGRAMS = {
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
    },
    'mikhail2_default': {
        name: 'Михаил',
        description: 'Off-season программа',
        athlete: 'Mikhail Timoshin',
        getProgram: function() { return MIKHAIL2_PROGRAM; }
    }
};

// User accounts (legacy — passwords removed, auth via Supabase)
// Unmigrated users are redirected to migration screen on login by username
export const ACCOUNTS = [
    { id: 'anastasia', login: 'nastya', name: 'nasteenish', programId: 'anastasia_default', premium: true },
    { id: 'mikhail',   login: 'misha',  name: 'Дима',       programId: 'mikhail_default', premium: true },
    { id: 'mikhail2',  login: 'thegealaks', name: 'Михаил', programId: 'mikhail2_default', premium: true }
];

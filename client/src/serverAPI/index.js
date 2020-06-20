/* eslint-disable import/prefer-default-export */
import axios from 'axios';

const mainUrl = 'http://localhost:9000/';
const signUpUrl = `${mainUrl}sign-up`;

export const createNewUser = async (values) => axios.post(signUpUrl, values);

'use client';

import axios, { AxiosInstance } from 'axios';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const clientUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const axiosClient: AxiosInstance = axios.create({
  baseURL: serverUrl + '/api',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    const res = error?.response;

    if (res?.status === 401) {
      window.location.href = `${clientUrl}`;
    }

    return Promise.reject(error);
  }
);

axiosClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const requestObject = async function (options: any) {
  const onSuccess = function (response: any) {
    // console.debug('Request Successful!', response);
    return response.data;
  };

  const onError = function (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = `${clientUrl}`;
      }
    } else {
    }

    return Promise.reject(error.response || error.message);
  };

  try {
    const response = await axiosClient(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

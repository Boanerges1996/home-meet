'use client';
import { IMeeting, IUser } from '@/util';
import { createContext, useState } from 'react';

const checkIsLoggedFromLocalStorage = () => {
  const isLogged =
    typeof window !== 'undefined' && localStorage.getItem('isLogged');

  return isLogged;
};

console.log('checkIsLoggedFromLocalStorage', checkIsLoggedFromLocalStorage());

export const AppContext = createContext<{
  profile: IUser;
  meetings: IMeeting[];
  publicMeetings?: IMeeting[];
  token?: string;
  isLogged?: boolean;
  setProfileCtx?: (profile: IUser) => void;
  setMeetingsCtx?: (meetings: IMeeting[]) => void;
  setPublicMeetingsCtx?: (meetings: IMeeting[]) => void;
  setTokenCtx?: (token: string) => void;
  setIsLogged?: (isLogged: boolean) => void;
}>({
  profile: {},
  meetings: [],
  publicMeetings: [],
  isLogged: false,
});

export const HomeMeetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<IUser>({});
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [publicMeetings, setPublicMeetings] = useState<IMeeting[]>([]);
  const [token, setToken] = useState<string>();
  const [isLogged, setIsLogged] = useState<boolean>(false);

  const setProfileCtx = (profile: IUser) => {
    setProfile(profile);
  };

  const setMeetingsCtx = (meetings: IMeeting[]) => {
    setMeetings(meetings);
  };

  const setPublicMeetingsCtx = (meetings: IMeeting[]) => {
    setPublicMeetings(meetings);
  };

  const setTokenCtx = (token: string) => {
    setToken(token);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        meetings,
        publicMeetings,
        token,
        isLogged,
        setProfileCtx,
        setMeetingsCtx,
        setPublicMeetingsCtx,
        setTokenCtx,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

import { axiosClient, IMeeting, IUser } from '@/util';
import { createContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

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
  setIsLoggedCtx?: (isLogged: boolean) => void;
  addNewMeetingCtx?: (meeting: IMeeting) => void;
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

  const query = useQuery(
    ['get-all-meetings'],
    async () => {
      return axiosClient.get('/meet/get-all');
    },
    {
      onSuccess: (res) => {
        const result = {
          status: res.status + '-' + res.statusText,
          headers: res.headers,
          data: res.data,
        };

        setMeetings(result.data?.data ?? []);
      },
      onError(err: any) {
        const errorMsg = err?.response?.data?.message ?? 'Something went wrong';
      },
      staleTime: 0,
    }
  );

  const setProfileCtx = (profile: IUser) => {
    localStorage.setItem('profile', JSON.stringify(profile));
    setProfile(profile);
  };

  const setMeetingsCtx = (meetings: IMeeting[]) => {
    setMeetings(meetings);
  };

  const setPublicMeetingsCtx = (meetings: IMeeting[]) => {
    setPublicMeetings(meetings);
  };

  const setTokenCtx = (token: string) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const setIsLoggedCtx = (logged: boolean) => {
    localStorage.setItem('isLogged', logged ? 'true' : 'false');
    setIsLogged(logged);
  };

  const addNewMeetingCtx = (meeting: IMeeting) => {
    setMeetings((prev) => [...prev, meeting]);
  };

  useEffect(() => {
    const logged = localStorage.getItem('isLogged') ? true : false;
    const token = localStorage.getItem('token');
    const profile = localStorage.getItem('profile');
    setIsLogged(logged);
    setToken(token ?? '');
    setProfile(JSON.parse(profile ?? '{}'));
  }, []);

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
        setIsLoggedCtx,
        addNewMeetingCtx,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

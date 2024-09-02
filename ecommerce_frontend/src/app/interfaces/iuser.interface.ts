export interface IUser {
  id: number;
  username: string;
  email: string;
  isStaff: string;
  is_staff: boolean;
  first_name: string;
  last_name: string;
  last_login: string;
  date_joined: string;
}

export interface IUserFull {
  pk: number;
  fields: IUser;
}
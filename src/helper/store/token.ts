/**
 * File: 对 Token 的管理
 */
import store from 'store';

const TokenKey: string = 'accessToken';
const RefreshTokenKey: string = 'refreshToken';
const FirstLoginKey: string = 'isFirstLogin';
const UserKey: string = 'user';

const Token = {
  isLogin() {
    return !!store.get(TokenKey);
  },

  isLoginFirst() {
    return !!store.get(FirstLoginKey);
  },
  setLoginFirst(isFirst: boolean) {
    return store.set(FirstLoginKey, isFirst);
  },

  getAccessToken() {
    return store.get(TokenKey);
  },
  setAccessToken(token: string) {
    return store.set(TokenKey, token);
  },
  removeAccessToken() {
    return store.remove(TokenKey);
  },

  getRefreshToken() {
    return store.get(RefreshTokenKey);
  },
  setRefreshToken(token: string) {
    return store.set(RefreshTokenKey, token);
  },
  removeRefreshToken() {
    return store.remove(RefreshTokenKey);
  },

  getUser() {
    return store.get(UserKey);
  },
  setUser(user: { nickname: string; avatarUrl?: string; phone?: string }) {
    return store.set(UserKey, user);
  },

  removeSession() {
    return store.clearAll();
  },
};

export default Token;

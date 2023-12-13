// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import counterSlice from './counterSlice';
import userSlice from './userSlice';

// 각각의 slice에서 반환하는 state 타입을 가져와서 합칩니다.
type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
    user: userSlice,
    counter: counterSlice,
    // 필요한 다른 reducer들을 추가하세요.
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;
export type { RootState };
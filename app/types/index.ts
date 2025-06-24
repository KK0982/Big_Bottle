// Central export for all type definitions

// Re-export staking types
export * from "./staking";

// Re-export common types
export * from "./common";

// Re-export existing types
export * from "../hooks/types";

// Type utilities
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Promise utilities
export type PromiseType<T> = T extends Promise<infer U> ? U : T;
export type AsyncReturnType<T extends (...args: any) => any> = PromiseType<
  ReturnType<T>
>;

// Array utilities
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type NonEmptyArray<T> = [T, ...T[]];

// Object utilities
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Function utilities
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Component utilities
export type ComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;
export type RefType<T> = T extends React.RefObject<infer R> ? R : never;

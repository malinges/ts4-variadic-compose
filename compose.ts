const identity = <T>(x: T) => x;

type Identity = typeof identity;

type Projector<A, B> = (a: A) => B;

type Tail<T extends any[]> = T extends [any, ...infer R] ? R : [];

type ComposedProjector<T extends Projector<any, any>[]> =
  // when no projectors are given...
  T extends []
  // return the identity function
  ? Identity
  // otherwise, when we can infer the type of the first projector...
  : T extends [Projector<infer A, infer B>, ...any[]]
  // recurse remaining projectors' types, and on type incompatibility...
  ? RecurseProjectorsTypes<B, Tail<T>> extends never
    // return never instead of Projector<FIRST_PROJECTOR_INPUT_TYPE, never>
    ? never
    // otherwise, return Projector<FIRST_PROJECTOR_INPUT_TYPE, LAST_PROJECTOR_RETURN_TYPE>
    : Projector<A, RecurseProjectorsTypes<B, Tail<T>>>
  // if first projector's type can't be inferred, return a generic Projector<any, any>
  : Projector<any, any>;

type RecurseProjectorsTypes<PrevRetType, Projectors extends Projector<any, any>[]> =
  // when no remaining projectors...
  Projectors extends []
  // return the return type of the previous (i.e. last) projector
  ? PrevRetType
  // otherwise, when we can infer the type of the first remaining projector...
  : Projectors extends [Projector<infer A, infer B>, ...any[]]
  // and its input type is compatible with the previous projector's return type...
  ? [PrevRetType] extends [A]
    // recurse the remaining projectors, passing the return type of the current projector
    ? RecurseProjectorsTypes<B, Tail<Projectors>>
    // if the previous projector's return type isn't compatible with the first remaining projector's input type, return never
    : never
  // if projector type can't be inferred, return any
  : any;

export function compose<T extends Projector<any, any>[]>(...fns: T): ComposedProjector<T>;
export function compose<T extends Projector<any, any>[]>(...fns: T): Projector<any, any> {
  if (fns.length === 0) {
    return identity;
  } else if (fns.length === 1) {
    return fns[0];
  } else {
    return (x: any) => fns.reduce((last, fn) => fn(last), x);
  }
}

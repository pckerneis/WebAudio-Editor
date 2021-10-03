import {Observable} from 'rxjs';
import {Dispatch, useEffect, useState} from 'react';

export default function WrapAsState<S>(obs: Observable<S>, initial: S) {
  const [getter, setter] = useState<S>(initial);

  useEffect(() => {
    const sub = obs.subscribe(setter);
    return () => sub.unsubscribe();
  }, [setter, obs]);

  return [getter, setter] as [S, Dispatch<S>];
}

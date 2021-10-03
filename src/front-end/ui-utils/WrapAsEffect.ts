import {Observable} from 'rxjs';
import {Dispatch, SetStateAction, useEffect} from 'react';

export default function WrapAsEffect<S>(obs: Observable<S>,
                                        dispatch: Dispatch<SetStateAction<S>>) {
  useEffect(() => {
    const sub = obs.subscribe(dispatch);
    return () => sub.unsubscribe();
  });
}

import SequenceGenerator from '../utils/SequenceGenerator';
import {BehaviorSubject, Observable} from 'rxjs';

const sequenceGenerator = new SequenceGenerator();

export default class MessageService {
  private _messages = new BehaviorSubject<Message[]>([]);

  public readonly messages$: Observable<Message[]>;

  constructor() {
    this.messages$ = this._messages.asObservable();
  }

  public get messages(): Message[] {
    return this._messages.value;
  }

  post(text: string, level: Level): void {
    const id = sequenceGenerator.nextString();
    this._messages.next([...this.messages, {
      text, level, id,
    }]);
  }

  close(id: string): void {
    this._messages.next(this.messages.filter(msg => msg.id !== id));
  }
}

type Level = 'info' | 'error' | 'warning';

export interface Message {
  id: string;
  text: string;
  level: Level;
}

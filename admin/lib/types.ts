import { Timestamp } from "firebase/firestore";

export interface Produto {
  id: string; // ID do documento do Firestore
  nome: string;
  descricao: string;
  preco: number;
  criadoPor: string; // UID do usuário
}

export interface Alerta {
  id: string;
  mensagem: string;
  criadoPor: string; // UID do usuário
  criadoEm: Timestamp;
}

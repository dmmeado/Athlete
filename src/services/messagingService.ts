import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message, UserRole } from '../types';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// Convert Firestore document to Conversation type
const docToConversation = (doc: any): Conversation => {
  const data = doc.data();
  return {
    id: doc.id,
    parentId: data.parentId,
    coachId: data.coachId,
    playerId: data.playerId,
    teamId: data.teamId,
    lastMessage: data.lastMessage
      ? {
          ...data.lastMessage,
          createdAt: data.lastMessage.createdAt?.toDate(),
        }
      : undefined,
    unreadCount: data.unreadCount || { parent: 0, coach: 0 },
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Convert Firestore document to Message type
const docToMessage = (doc: any): Message => {
  const data = doc.data();
  return {
    id: doc.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderRole: data.senderRole,
    content: data.content,
    read: data.read,
    createdAt: data.createdAt?.toDate(),
  };
};

// Get or create a conversation between a parent and coach about a player/team
export async function getOrCreateConversation(
  parentId: string,
  coachId: string,
  playerId: string,
  teamId: string
): Promise<Conversation> {
  // Check if conversation already exists
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('parentId', '==', parentId),
    where('coachId', '==', coachId),
    where('playerId', '==', playerId),
    where('teamId', '==', teamId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return docToConversation(snapshot.docs[0]);
  }

  // Create new conversation
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), {
    parentId,
    coachId,
    playerId,
    teamId,
    unreadCount: { parent: 0, coach: 0 },
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    parentId,
    coachId,
    playerId,
    teamId,
    unreadCount: { parent: 0, coach: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Get conversations for a user
export async function getConversations(
  userId: string,
  role: UserRole
): Promise<Conversation[]> {
  const field = role === 'parent' ? 'parentId' : 'coachId';
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where(field, '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToConversation);
}

// Get a single conversation by ID
export async function getConversationById(
  conversationId: string
): Promise<Conversation | null> {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return docToConversation(snapshot);
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderRole: UserRole,
  content: string
): Promise<Message> {
  const now = Timestamp.now();

  // Create message
  const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
    conversationId,
    senderId,
    senderRole,
    content,
    read: false,
    createdAt: now,
  });

  // Update conversation with last message and increment unread count
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  const unreadField = senderRole === 'parent' ? 'unreadCount.coach' : 'unreadCount.parent';

  await updateDoc(conversationRef, {
    lastMessage: {
      id: messageRef.id,
      conversationId,
      senderId,
      senderRole,
      content,
      read: false,
      createdAt: now,
    },
    [unreadField]: increment(1),
    updatedAt: now,
  });

  return {
    id: messageRef.id,
    conversationId,
    senderId,
    senderRole,
    content,
    read: false,
    createdAt: new Date(),
  };
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToMessage);
}

// Subscribe to messages in real-time
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(docToMessage);
    callback(messages);
  });
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  readerRole: UserRole
): Promise<void> {
  // Update all unread messages in the conversation
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    where('read', '==', false),
    where('senderRole', '!=', readerRole)
  );

  const snapshot = await getDocs(q);

  const updatePromises = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updatePromises);

  // Reset unread count for the reader
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  const unreadField = readerRole === 'parent' ? 'unreadCount.parent' : 'unreadCount.coach';

  await updateDoc(conversationRef, {
    [unreadField]: 0,
  });
}

// Get total unread count for a user
export async function getUnreadCount(
  userId: string,
  role: UserRole
): Promise<number> {
  const conversations = await getConversations(userId, role);
  return conversations.reduce((total, conv) => {
    return total + (role === 'parent' ? conv.unreadCount.parent : conv.unreadCount.coach);
  }, 0);
}

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types';
import { getConversations } from '../../services/messagingService';
import { COLORS } from '../../config/constants';

type MessagesScreenProps = {
  navigation: NativeStackNavigationProp<any, 'MessagesList'>;
};

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const convos = await getConversations(user.id, user.role);
      setConversations(convos);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!user) return 0;
    return user.role === 'parent'
      ? conversation.unreadCount.parent
      : conversation.unreadCount.coach;
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const unreadCount = getUnreadCount(item);

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate('Conversation', { conversationId: item.id })}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.conversationInfo}>
          <Text style={[styles.conversationTitle, unreadCount > 0 && styles.unreadTitle]}>
            Conversation
          </Text>
          {item.lastMessage && (
            <>
              <Text
                style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]}
                numberOfLines={1}
              >
                {item.lastMessage.content}
              </Text>
              <Text style={styles.timestamp}>
                {formatDistanceToNow(item.lastMessage.createdAt, { addSuffix: true })}
              </Text>
            </>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.text.light} />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>
                When you connect with {user?.role === 'parent' ? 'teams' : 'players'}, your conversations will appear here
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  unreadMessage: {
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

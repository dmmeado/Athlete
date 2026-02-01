import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ParentStackParamList } from '../../navigation/ParentTabNavigator';
import { VideoClip } from '../../types';
import { COLORS } from '../../config/constants';

type VideosScreenProps = {
  navigation: NativeStackNavigationProp<ParentStackParamList, 'Videos'>;
  route: RouteProp<ParentStackParamList, 'Videos'>;
};

export default function VideosScreen({ navigation, route }: VideosScreenProps) {
  const { playerId } = route.params;
  const [videos, setVideos] = useState<VideoClip[]>([]);

  const handleAddVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // TODO: Upload video to Firebase Storage
      Alert.alert('Coming Soon', 'Video upload will be available in the next update.');
    }
  };

  const renderVideo = ({ item }: { item: VideoClip }) => (
    <TouchableOpacity style={styles.videoCard}>
      <View style={styles.thumbnail}>
        <Ionicons name="play-circle" size={48} color={COLORS.text.inverse} />
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.videoDuration}>
          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideo}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyTitle}>No Highlight Videos</Text>
            <Text style={styles.emptyText}>
              Upload highlight videos to showcase your player's skills to coaches
            </Text>
            <TouchableOpacity style={styles.uploadButton} onPress={handleAddVideo}>
              <Ionicons name="cloud-upload" size={20} color={COLORS.text.inverse} />
              <Text style={styles.uploadButtonText}>Upload Video</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {videos.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddVideo}>
          <Ionicons name="add" size={28} color={COLORS.text.inverse} />
        </TouchableOpacity>
      )}
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
    flexGrow: 1,
  },
  videoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    height: 180,
    backgroundColor: COLORS.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  videoDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  videoDuration: {
    fontSize: 12,
    color: COLORS.text.light,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

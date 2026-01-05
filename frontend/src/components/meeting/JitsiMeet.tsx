'use client';

import React, { useEffect, useRef } from 'react';

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onLeave?: () => void;
  config?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    enableWelcomePage?: boolean;
    enableClosePage?: boolean;
  };
}

export default function JitsiMeet({
  roomName,
  displayName,
  onLeave,
  config = {},
}: JitsiMeetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (apiRef.current) {
      return;
    }

    // Load Jitsi Meet External API
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="external_api.js"]');
        if (existingScript) {
          // Wait for it to load
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Jitsi Meet')));
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet'));
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current || apiRef.current) {
          return;
        }

        // Jitsi Meet configuration
        const domain = 'meet.jit.si'; // Using public Jitsi Meet instance
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: config.startWithAudioMuted ?? false,
            startWithVideoMuted: config.startWithVideoMuted ?? false,
            enableWelcomePage: false, // Force disable welcome page
            enableClosePage: config.enableClosePage ?? true,
            disableDeepLinking: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            enableTalkWhileMuted: false,
            enableLayerSuspension: true,
            channelLastN: -1, // -1 means unlimited
            startAudioOnly: false,
            startScreenSharing: false,
            enableEmailInStats: false,
            enableDisplayNameInStats: false,
            enableLipSync: false,
            disableThirdPartyRequests: false,
            prejoinPageEnabled: false, // Disable prejoin page to join directly
            requireDisplayName: false, // Don't require display name input
            // Remove moderator requirement - allow anyone to start
            enableLobbyChat: false,
            enableKnockingLobby: false,
            enableInsecureRoomNameWarning: false,
            // Disable moderator requirement completely
            enableModeratorIndicator: false,
            enableRemoteVideoMenu: true,
            enableRemb: true,
            enableTcc: true,
            useStunTurn: true,
            // Set default language
            defaultLanguage: 'vi',
            // Disable lobby completely
            enablePrejoinPage: false,
            constraints: {
              video: {
                height: { ideal: 720, max: 1080, min: 240 },
                width: { ideal: 1280, max: 1920, min: 320 },
              },
            },
            p2p: {
              enabled: true,
              stunServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
              ],
            },
            analytics: {
              disabled: true,
            },
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'security',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            APP_NAME: 'E-Learning',
            NATIVE_APP_NAME: 'E-Learning',
            PROVIDER_NAME: 'E-Learning Platform',
            DEFAULT_BACKGROUND: '#474747',
            HIDE_INVITE_MORE_HEADER: false,
            CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
            CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
            VIDEO_LAYOUT_FIT: 'both',
            INITIAL_TOOLBAR_TIMEOUT: 20000,
            TOOLBAR_TIMEOUT: 4000,
            TOOLBAR_ALWAYS_VISIBLE: false,
            DISABLE_PRESENCE_STATUS: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          },
          userInfo: {
            displayName: displayName,
            email: '', // Optional: can add email if available
          },
          // Set user as moderator to bypass moderator requirement
          jwt: undefined, // No JWT needed for public instance
          onload: () => {
            console.log('Jitsi Meet loaded');
          },
        };

        // Initialize Jitsi Meet API
        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        // Auto-click "I am moderator" button when it appears
        const setupModeratorAutoClick = () => {
          const iframe = jitsiContainerRef.current?.querySelector('iframe');
          if (!iframe) return;

          const tryClick = () => {
            try {
              const iframeDoc = iframe.contentDocument || (iframe.contentWindow as any)?.document;
              if (!iframeDoc) return;

              // Find button with moderator text
              const buttons = iframeDoc.querySelectorAll('button, [role="button"]');
              for (const btn of Array.from(buttons) as HTMLElement[]) {
                const text = (btn.textContent || '').toLowerCase();
                if (text.includes('moderator') || text.includes('quản trị') || text.includes('administrator') || text.includes('mình là')) {
                  btn.click();
                  console.log('✅ Auto-clicked moderator button');
                  return true;
                }
              }
            } catch (e) {
              // Cross-origin, use interval retry instead
            }
            return false;
          };

          // Try immediately and then with intervals
          if (!tryClick()) {
            const intervals = [500, 1000, 2000, 3000, 5000];
            intervals.forEach(delay => {
              setTimeout(tryClick, delay);
            });
          }
        };

        // Setup after iframe loads
        setTimeout(setupModeratorAutoClick, 2000);

        // Event handlers
        api.addEventListener('readyToClose', () => {
          console.log('Ready to close');
          if (onLeave) {
            onLeave();
          }
        });

        // Handle moderator requirement
        api.addEventListener('participantRoleChanged', (event: any) => {
          console.log('Participant role changed:', event);
        });

        api.addEventListener('videoConferenceJoined', () => {
          console.log('✅ Joined video conference');
        });

        api.addEventListener('participantJoined', (participant: any) => {
          console.log('Participant joined:', participant);
        });

        api.addEventListener('participantLeft', (participant: any) => {
          console.log('Participant left:', participant);
        });

        api.addEventListener('audioMuteStatusChanged', (data: any) => {
          console.log('Audio mute status changed:', data);
        });

        api.addEventListener('videoMuteStatusChanged', (data: any) => {
          console.log('Video mute status changed:', data);
        });

        api.addEventListener('cameraError', (error: any) => {
          console.error('Camera error:', error);
        });

        api.addEventListener('micError', (error: any) => {
          console.error('Microphone error:', error);
        });

        api.addEventListener('deviceListChanged', (devices: any) => {
          console.log('Device list changed:', devices);
        });

      } catch (error) {
        console.error('Error initializing Jitsi Meet:', error);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (error) {
          console.error('Error disposing Jitsi Meet:', error);
        }
      }
    };
  }, [roomName, displayName, onLeave, config]);

  return (
    <div className="w-full h-full absolute inset-0">
      <div ref={jitsiContainerRef} className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}


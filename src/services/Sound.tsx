import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
export type SoundHandle = { play: (kind: 'step' | 'crash' | 'boost') => void };
export const Sound = forwardRef<SoundHandle, { enabled: boolean }>(
  function Sound({ enabled }, ref) {
    const web = useRef<WebView<{}>>(null);
    useImperativeHandle(
      ref,
      () => ({
        play: kind => {
          if (enabled) {
            web.current?.injectJavaScript(`playTone('${kind}');true;`);
          }
        },
      }),
      [enabled],
    );
    return (
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      >
        <WebView<{}>
          ref={web}
          mediaPlaybackRequiresUserAction={false}
          source={{
            html: '<html><body><script>var ctx;function playTone(k){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();var o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type=k==="crash"?"sawtooth":"sine";o.frequency.setValueAtTime(k==="step"?650:k==="boost"?950:140,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(60,ctx.currentTime+0.17);g.gain.setValueAtTime(0.12,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}catch(e){}}</script></body></html>',
          }}
        />
      </View>
    );
  },
);

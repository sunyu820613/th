const test = require('node:test');
const assert = require('node:assert');
const Util = require('../app/js/util.js');
const M3U = require('../app/js/m3u.js');
const Subtitle = require('../app/js/subtitle.js');

test('Util.kind / ext / fmtTime', () => {
  assert.strictEqual(Util.kind('a.MKV'), 'video');
  assert.strictEqual(Util.kind('a.srt'), 'sub');
  assert.strictEqual(Util.kind('list.m3u'), 'playlist');
  assert.strictEqual(Util.kind('readme.txt'), 'other');
  assert.strictEqual(Util.ext('http://h/a/b.m3u8?token=1.2'), 'm3u8');
  assert.strictEqual(Util.fmtTime(3725), '1:02:05');
  assert.strictEqual(Util.fmtTime(65), '1:05');
  assert.strictEqual(Util.basename('http://h/a/%E4%B8%AD.mp4'), '中.mp4');
});

test('M3U.parse extended playlist', () => {
  const r = M3U.parse('﻿#EXTM3U\r\n#EXTINF:-1 tvg-logo="http://l/1.png" group-title="央视",CCTV-1 综合\r\nhttp://h/1.m3u8\r\n#EXTINF:-1,Plain\r\nhttp://h/2.flv\r\n');
  assert.strictEqual(r.type, 'list');
  assert.strictEqual(r.items.length, 2);
  assert.deepStrictEqual(r.items[0], { name: 'CCTV-1 综合', group: '央视', logo: 'http://l/1.png', url: 'http://h/1.m3u8' });
  assert.strictEqual(r.items[1].name, 'Plain');
  assert.deepStrictEqual(M3U.groups(r.items), ['央视']);
});

test('M3U.parse detects HLS media playlist', () => {
  assert.strictEqual(M3U.parse('#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6,\nseg0.ts\n').type, 'hls');
});

test('M3U.parse name,url text format with #genre#', () => {
  const r = M3U.parse('央视,#genre#\nCCTV1,http://h/1\n卫视,#genre#\n湖南卫视,http://h/2\n');
  assert.deepStrictEqual(r.items.map(i => [i.group, i.name]), [['央视', 'CCTV1'], ['卫视', '湖南卫视']]);
});

test('M3U.parse resolves relative urls against base', () => {
  const r = M3U.parse('#EXTM3U\n#EXTINF:-1,A\n../x/a.mp4\n', 'http://h/p/q/list.m3u');
  assert.strictEqual(r.items[0].url, 'http://h/p/x/a.mp4');
});

test('Subtitle SRT -> VTT', () => {
  const v = Subtitle.toVtt('1\r\n00:00:01,500 --> 00:00:03,000\r\n你好\r\n', 'a.srt');
  assert.ok(v.startsWith('WEBVTT'));
  assert.ok(v.includes('00:00:01.500 --> 00:00:03.000'));
});

test('Subtitle ASS -> VTT strips tags, keeps commas in text, sorts', () => {
  const ass = [
    '[Script Info]', 'Title: x', '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    'Dialogue: 0,0:00:05.00,0:00:06.50,Default,,0,0,0,,{\\an8}后面,的一句',
    'Dialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,第一句\\N换行'
  ].join('\n');
  const v = Subtitle.toVtt(ass, 'a.ass');
  assert.ok(v.indexOf('00:00:01.000 --> 00:00:02.000\n第一句\n换行') < v.indexOf('00:00:05.000 --> 00:00:06.500\n后面,的一句'));
  assert.ok(v.includes('00:00:05.000 --> 00:00:06.500\n后面,的一句'));
});

test('Subtitle.decode falls back to GB18030', () => {
  const gbk = new Uint8Array([0xC4, 0xE3, 0xBA, 0xC3]); // 你好
  assert.strictEqual(Subtitle.decode(gbk.buffer), '你好');
  assert.strictEqual(Subtitle.decode(new TextEncoder().encode('你好').buffer), '你好');
});

/* ==========================================================================
   Site Data — 更新頻度の高い情報はこのファイルだけを編集すれば反映されます
   --------------------------------------------------------------------------
   ・videos    : 動画一覧（トップの「VIDEOS」タブ）。category を追加するとタブも自動で増えます
   ・schedule  : 週間配信スケジュール（毎週の定期予定）
   ※ 「TODO」と書かれた値は仮の内容です。実際の情報に置き換えてください。
   ========================================================================== */
window.SITE_DATA = {
  channelUrl: "https://www.youtube.com/@AzuriteGG",

  /* ---------- 動画カテゴリ（表示順） ---------- */
  videoCategories: [
    { key: "growth", label: "成長記録" },
    { key: "settings", label: "設定・解説" },
    { key: "minecraft", label: "マイクラ" },
    { key: "killclips", label: "キル集" },
    { key: "variety", label: "企画・その他" },
    { key: "archive", label: "配信アーカイブ" },
    { key: "promotion", label: "案件" }
  ],

  /* ---------- 動画一覧（新しい順） ----------
     id       : YouTube の動画ID（https://www.youtube.com/watch?v=【ここ】）
     category : 上の videoCategories の key
     label    : カードに表示する小さなラベル                                   */
  videos: [
    {
      id: "mC4cfe-H-co",
      title: "【フォートナイト成長記録】SwitchからPCへ移行後8か月の成果は？",
      category: "growth",
      label: "人気No.1"
    },
    {
      id: "gfWLGDYIIwg",
      title: "【フォートナイト成長記録】大人気動画の第2弾！",
      category: "growth",
      label: "第2弾"
    },
    {
      id: "F8rl1wCNwfM",
      title: "【フォートナイト】あずらいとの設定＆感度をご紹介！",
      category: "settings",
      label: "設定公開"
    },
    {
      id: "OXYM70-LMCY",
      title: "【フォートナイト】チャプター3シーズン3の競技シーン最新情報を詳しく紹介！！【ゆっくり解説】",
      category: "settings",
      label: "ゆっくり解説"
    },
    {
      id: "CCUmVMByaog",
      title: "【音ブロック】狂花水月 - 星のカービィ トリプルデラックス【マイクラ】",
      category: "minecraft",
      label: "音ブロック"
    },
    {
      id: "Lp1C_pSV-9A",
      title: "【マインクラフト】前回の失敗を生かし新拠点が遂に完成!?新メンバーも登場！PART2",
      category: "minecraft",
      label: "サバイバル"
    },
    {
      id: "9VVA9vo2aQU",
      title: "スナイパーのキル集【フォートナイト】",
      category: "killclips",
      label: "キル集"
    },
    {
      id: "MDCzevYUe6Q",
      title: "VALORANTの初キル集！【祝福】【YOASOBI】",
      category: "killclips",
      label: "キル集"
    },
    {
      id: "UaxH7H2eMjA",
      title: "ハンバーガー屋の経営を体験できるファストフードシミュレーターを2人で攻略していく",
      category: "variety",
      label: "店舗経営"
    },
    {
      id: "FjJAPS9R0r0",
      title: "【フォートナイト】仲間二人が勝手に建築無し縛りをしていたら気付くのか!?検証してみた！",
      category: "variety",
      label: "ドッキリ"
    },
    {
      id: "cvoGL4GPnqo",
      title: "【Magcore 87】打鍵感と反応速度が最高すぎるキーボードでフォートナイトをプレイしてみた【Epomaker】",
      category: "promotion",
      label: "キーボード案件"
    },
    {
      id: "bpKJYP2YMDs",
      title: "【フォートナイト】新シーズンが来たので無双していきますか....【あずらいと】",
      category: "promotion",
      label: "マウスグリップ案件"
    }
  ],

  /* ---------- 週間配信スケジュール ----------
     曜日キー: mon / tue / wed / thu / fri / sat / sun
     type    : "live"（配信） / "video"（動画投稿） / "collab"（コラボ）
     予定が無い曜日は空配列 [] にすると「おやすみ」と表示されます            */
  schedule: {
    // trueにするとスケジュール表を非表示にして、下の noticeHtml を表示します
    useNotice: true,
    noticeHtml: '最新の配信スケジュールは<a href="https://x.com/Azuriteeeee" target="_blank" rel="noopener" style="text-decoration:underline;">Twitter</a>をご確認ください。',
    note: "予定は変更になる場合があります。最新情報はTwitterをご確認ください。",

    // 【手動で日付を変更する場合】
    // ここに月曜日の日付（例: "2026/10/05"）を入れると、1週間分の日付が自動計算されます。
    // 空欄 "" にした場合は、自動的に「今週の月曜日」が基準になります。
    startDate: "2026/10/12",

    weekly: {
      mon: [],
      tue: [{ time: "21:00", title: "フォートナイト ランク配信", type: "live" }],
      wed: [{ time: "18:00", title: "ショート動画投稿", type: "video" }],
      thu: [{ time: "21:00", title: "マイクラ まったり工業", type: "live" }],
      fri: [],
      sat: [
        { time: "12:00", title: "成長記録・企画動画", type: "video" },
        { time: "21:00", title: "フォートナイト 参加型", type: "live" }
      ],
      sun: [{ time: "20:00", title: "友達とコラボ配信", type: "collab" }]
    }
  }
};

/* 
  1行スケジュール
      tue: [{ time: "21:00", title: "フォートナイト ランク配信", type: "live" }],

  2行スケジュール
      sat: [
        { time: "12:00", title: "成長記録・企画動画", type: "video" },
        { time: "21:00", title: "フォートナイト 参加型", type: "live" }
      ],
*/
<template>
    <div class="container">
        <!-- Điều khiển âm thanh -->
        <audio ref="audio" :src="audioSrc" @timeupdate="onTimeUpdate" @ended="onAudioEnded" preload="auto"></audio>

        <div class="controls">
            <!-- Nút Play/Pause -->
            <button @click="togglePlay" class="play-pause-button">
                <span v-if="isPlaying">■</span>
                <span v-else>▶</span>
            </button>

            <!-- Thanh phát (slider) -->
            <input type="range" min="0" :max="audioDuration" v-model="currentTime" @input="onSliderChange"
                class="audio-slider" />
            <span>{{ formatTime(currentTime) }} / {{ formatTime(audioDuration) }}</span>
        </div>

        <!-- Hiển thị đoạn hội thoại -->
        <div class="dialogues">
            <div v-for="(line, lineIndex) in dialogues" :key="lineIndex">
                <span v-for="(char, charIndex) in line.characters" :key="charIndex"
                    :class="getClassForCharacter(lineIndex, charIndex)">
                    {{ char.char }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const audioSrc = '/audio.opus';
const audio = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const audioDuration = ref(0);
const dialogues = ref([]);  // Mảng chứa các đoạn hội thoại
const timestamps = ref([]);  // Mảng chứa các timestamp

// Lấy dữ liệu đoạn hội thoại
const fetchDialogues = async () => {
    try {
        const response = await fetch('/output_AB.txt');
        const data = await response.text();
        dialogues.value = data.split('\n').map(line => {
            const [character, ...message] = line.split(':');
            const messageText = message.join(':').trim();
            const characters = messageText.split('').map((char, index) => ({
                char: char,
                index: index
            })); // Tách câu thành các ký tự
            return { character: character.trim(), characters };
        });
    } catch (error) {
        console.error('Error reading dialogues:', error);
    }
};

// Lấy dữ liệu timestamps
const fetchTimestamps = async () => {
    try {
        const response = await fetch('/timestamp.txt');
        const data = await response.text();
        timestamps.value = data.split('\n').map(line => {
            const [start, duration, index, wordLength] = line.split(',').map(Number);
            return { start, end: start + duration, index, wordLength };
        });
    } catch (error) {
        console.error('Error reading timestamps:', error);
    }
};

// Hàm tính toán timestamp và ký tự
const getClassForCharacter = (lineIndex, charIndex) => {
    const currentTimeInMilliseconds = currentTime.value * 1000;

    // Thêm một khoảng thời gian buffer để đảm bảo bôi vàng đúng lúc
    const buffer = 100; // Độ trễ nhỏ (100ms) để bôi vàng chính xác hơn

    // Tạo một chuỗi văn bản duy nhất từ tất cả các dòng
    const fullText = dialogues.value.map(line => line.characters.map(c => c.char).join('')).join('');

    // Xác định vị trí của ký tự trong toàn bộ chuỗi văn bản
    const globalCharIndex = dialogues.value.slice(0, lineIndex)
        .reduce((acc, line) => acc + line.characters.length, 0) + charIndex;

    // Kiểm tra xem ký tự này có cần bôi vàng không
    const isHighlighted = timestamps.value.some(timestamp =>
        globalCharIndex >= timestamp.index &&
        globalCharIndex < timestamp.index + timestamp.wordLength &&
        currentTimeInMilliseconds + buffer >= timestamp.start &&
        currentTimeInMilliseconds - buffer <= timestamp.end
    );

    // Trả về class phù hợp cho từng ký tự
    return {
        highlight: isHighlighted,
        'highlight-b': dialogues.value[lineIndex].character === 'B', // Nếu nhân vật là B thì bôi đậm
    };
};

onMounted(() => {
    fetchDialogues();
    fetchTimestamps();
    audio.value = document.querySelector('audio');
    audio.value.addEventListener('loadedmetadata', () => {
        audioDuration.value = audio.value.duration;
    });
});

// Điều khiển phát âm thanh
const togglePlay = () => {
    if (isPlaying.value) {
        audio.value.pause();
    } else {
        audio.value.play();
    }
    isPlaying.value = !isPlaying.value;
};

// Cập nhật thời gian
const onTimeUpdate = () => {
    setTimeout(() => {
        currentTime.value = audio.value.currentTime;
    }, 50); // Thêm 50ms delay (hoặc thử giá trị khác) để cải thiện đồng bộ hóa
};

const onSliderChange = () => {
    audio.value.currentTime = currentTime.value;
};

// Định dạng thời gian
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
</script>

<style scoped>
.container {
    width: 100%;
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
}

.play-pause-button {
    font-size: 24px;
    color: black;
    padding: 10px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.audio-slider {
    width: 90%;
    margin-top: 20px;
    height: 8px;
    background-color: #ddd;
    border-radius: 5px;
    transition: background-color 0.3s ease-in-out;
}

.dialogues {
    margin-top: 20px;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
}

.dialogues div {
    margin: 5px 0;
    padding: 5px;
    font-size: 18px;
    transition: background-color 0.3s ease;
}

.highlight {
    background-color: yellow;
    color: black;
}

.highlight-b {
    color: #085ef2;
}
</style>

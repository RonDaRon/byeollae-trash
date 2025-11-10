// 종량제 봉투 가격 (원)
const BAG_PRICE_10L = 370;
const BAG_PRICE_20L = 740;

/**
 * 재활용품 종류와 양에 따라 지급해야 할 보상을 계산합니다.
 * @param {string} type - 쓰레기 종류 (예: 'PET', 'CLOTHES', 'PAPERPACK', 'BATTERY', 'LAMP')
 * @param {number} amount - 무게 (kg) 또는 개수 (개)
 * @returns {object} 계산된 보상 정보
 */
function calculateReward(type, amount) {
    const results = {};

    // 1. 기본 계산 (가치, 봉투 개수 계산 기반)
    let valueInWon = 0; // 원화 가치 (상품권 계산에 사용)
    let baseBagCount10L = 0; // 10L 봉투 기준으로 변환된 개수 (반올림 필요한 경우 사용)

    switch (type) {
        case 'PET': // 투명 페트병: 1 kg 당 600원
            valueInWon = amount * 600;
            // 10L 봉투 개수 (370원 기준) = (가치 / 370원). 반올림 처리
            baseBagCount10L = Math.round(valueInWon / BAG_PRICE_10L);
            break;

        case 'CLOTHES': // 의류: 3 kg 당 370원
            // 3kg 당 370원이므로, 1kg 당 370/3 원
            valueInWon = (amount / 3) * 370;
            // 10L 봉투 개수 (370원 기준) = (가치 / 370원). 반올림 처리
            baseBagCount10L = Math.round(valueInWon / BAG_PRICE_10L);
            break;

        case 'PAPERPACK': // 종이팩: 1 kg 당 10L 1장, 2 kg 당 20L 1장, 1 kg 당 화장지 1롤
            // 종량제 봉투는 기존대로 Math.floor (버림) 유지
            results.bag10L = `${Math.floor(amount)}장`; // 1kg 당 10L 1장
            results.bag20L = `${Math.floor(amount / 2)}장`; // 2kg 당 20L 1장
            // 화장지 지급은 Math.round (반올림)으로 변경
            results.toiletPaper = `${Math.round(amount)}롤`; // 1kg 당 화장지 1롤 (반올림 적용)
            
            return results;
            // 다른 로직은 생략하고 고정된 값을 반환
            return results;

        case 'BATTERY': // 폐건전지: 500 g(0.5kg) 당 10L 1장, 1 kg 당 20L 1장
            // 무게(kg) / 0.5 = 10L 개수
            results.bag10L = `${Math.floor(amount / 0.5)}장`;
            // 무게(kg) / 1 = 20L 개수
            results.bag20L = `${Math.floor(amount / 1)}장`;
            return results;

        case 'LAMP': // 폐형광등: 5개 당 10L 1장, 10개 당 20L 1장
            // 개수 / 5 = 10L 개수
            results.bag10L = `${Math.floor(amount / 5)}장`;
            // 개수 / 10 = 20L 개수
            results.bag20L = `${Math.floor(amount / 10)}장`;
            return results;

        default:
            return { error: "유효하지 않은 쓰레기 종류입니다." };
    }

    // 2. 종량제 봉투 계산 (PET, CLOTHES에 적용. 반올림된 baseBagCount10L 사용)
    // 10L 봉투: baseBagCount10L 장
    results.bag10L = `${baseBagCount10L}장`;

    // 20L 봉투: 10L 봉투 2장 가치와 같음. baseBagCount10L / 2
    // 주의: baseBagCount10L이 홀수여도 20L 봉투만 지급해야 하므로 Math.floor 사용
    results.bag20L = `${Math.floor(baseBagCount10L / 2)}장`;


    // 3. 상품권 계산 (PET, CLOTHES에 적용)
    // 10원 단위로 제공, 1원 단위 버림
    const giftCert = Math.floor(valueInWon / 10) * 10;
    results.giftCertificate = `${giftCert}원`;

    return results;
}

// ---------------- UI 상호작용 관련 로직 ----------------

document.addEventListener('DOMContentLoaded', () => {
    const typeSelect = document.getElementById('wasteType');
    const amountInputContainer = document.getElementById('amountInputContainer');
    const amountInput = document.getElementById('amount');
    const inputLabel = document.getElementById('amountLabel');
    const calculateButton = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');

    // 1. 드롭다운 변경 시 입력창 레이블 변경 및 초기화
    typeSelect.addEventListener('change', () => {
        const selectedType = typeSelect.value;
        amountInput.value = ''; // 값 초기화
        resultDiv.innerHTML = ''; // 결과 초기화

        if (selectedType) {
            amountInputContainer.style.display = 'block';
            switch (selectedType) {
                case 'LAMP':
                    inputLabel.textContent = '개수 (개)';
                    amountInput.placeholder = '개수를 입력하세요 (예: 15)';
                    break;
                default:
                    inputLabel.textContent = '무게 (kg)';
                    amountInput.placeholder = '무게를 입력하세요 (예: 3.7)';
            }
        } else {
            amountInputContainer.style.display = 'none';
        }
    });

    // 2. 계산 버튼 클릭 시 로직 실행
    calculateButton.addEventListener('click', () => {
        const type = typeSelect.value;
        const amount = parseFloat(amountInput.value);

        if (!type || isNaN(amount) || amount <= 0) {
            resultDiv.innerHTML = '<p style="color: red;">쓰레기 종류를 선택하고 유효한 양을 입력해주세요.</p>';
            return;
        }

        const rewards = calculateReward(type, amount);
        displayResults(rewards, type, amount, resultDiv);
    });

    // **3. 엔터 키 감지 로직 추가 (수정)**
    amountInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            calculateButton.click();
        }
    });
});


/**
 * 계산 결과를 웹페이지에 표시하는 함수
 */
function displayResults(rewards, type, amount, resultElement) {
    let output = `
        <h3>✅ 보상 계산 결과 (종류: ${type}, 양: ${amount} ${type === 'LAMP' ? '개' : 'kg'})</h3>
        <ul>
    `;

    // PET, CLOTHES
    if (type === 'PET' || type === 'CLOTHES') {
        output += `
            <li>**종량제 봉투 (10L)**: ${rewards.bag10L} (단일 지급)</li>
            <li>**종량제 봉투 (20L)**: ${rewards.bag20L} (단일 지급)</li>
            <li>**상품권**: ${rewards.giftCertificate} (10원 단위 절사)</li>
        `;
    }
    // PAPERPACK
    else if (type === 'PAPERPACK') {
        output += `
            <li>**종량제 봉투 (10L)**: ${rewards.bag10L} (단일 지급)</li>
            <li>**종량제 봉투 (20L)**: ${rewards.bag20L} (단일 지급)</li>
            <li>**화장지**: ${rewards.toiletPaper} (단일 지급)</li>
        `;
    }
    // BATTERY, LAMP
    else if (type === 'BATTERY' || type === 'LAMP') {
        output += `
            <li>**종량제 봉투 (10L)**: ${rewards.bag10L} (단일 지급)</li>
            <li>**종량제 봉투 (20L)**: ${rewards.bag20L} (단일 지급)</li>
        `;
    }

    output += `</ul>`;
    resultElement.innerHTML = output;
}

// 예시: 투명 페트병 3.7 kg 계산 (요구사항 확인)
// const example = calculateReward('PET', 3.7);
// console.log(example);
// 기대값: (3.7 * 600) = 2220원. 2220 / 370 = 6. 
// bag10L: 6장, bag20L: Math.floor(6/2)=3장, giftCertificate: 2220원.
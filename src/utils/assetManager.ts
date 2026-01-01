export const getLanguageImage = (imageKey: string) => {
    if (imageKey === 'quenya') return require('../../assets/images/quenya.png');
    if (imageKey === 'klingon') return require('../../assets/images/klingon.png');
    if (imageKey === 'dothraki') return require('../../assets/images/dothraki.png');
    if (imageKey === 'sindarin') return require('../../assets/images/sindarin.png');
    return require('../../assets/images/quenya.png');
};

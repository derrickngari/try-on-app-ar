const genOrderNum = (prefix) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

module.exports = { genOrderNum };
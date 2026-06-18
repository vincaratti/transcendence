
function dump(wrapper, label = 'debug') {
    console.log(`---${label}---`);
    console.log('HTML:', wrapper.html());
    console.log('Text:', wrapper.text());
    console.log('Emitted:', wrapper.emitted());
    console.log('State:', wrapper.vm);
    console.log('Props:', wrapper.props());
    console.log('Attributes:', wrapper.attributes());
    console.log('Classes:', wrapper.classes());
    console.log('Styles:', wrapper.element.style);
    console.log('---End of debug---');
}

function debugExpect(condition, wrapper, assertionFn) {
    try {
        assertionFn();
    } catch (error) {
        
        console.log('---Debug Info---');
        console.log('HTML:', wrapper.html());
        console.log('Emitted:', wrapper.emitted());
        console.log('State:', wrapper.vm);

        throw error;
    }
}
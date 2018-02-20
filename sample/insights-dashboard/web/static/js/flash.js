import flash from '../views/partials/default/flash';
import flashLi from '../views/partials/default/flashLi';
import map from 'lodash/map';

class Flash {
    static render({target = '.content-header', payload = {}, type = 'error'} = {}) {
        payload.type = type;

        const isFlashInDom = $('.flash-msgs').is(':visible');

        if (isFlashInDom) {
            // element is present in dom, append errors to ul
            const newErrors = map(payload.errors, (error) => {
                return flashLi(error);
            });

            return $('.flash-msgs > ul').append(newErrors);
        }

        $(target).html(flash(payload));
    }
}

export default Flash;

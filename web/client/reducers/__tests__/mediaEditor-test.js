/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import mediaEditor, {DEFAULT_STATE} from '../mediaEditor';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    chooseMedia,
    hide,
    loadMediaSuccess,
    selectItem,
    setAddingMedia,
    setEditingMedia,
    setMediaService,
    setMediaType,
    show,
    updateItem,
    loadingSelectedMedia,
    loadingMediaList, disableMediaType
} from '../../actions/mediaEditor';
import { refreshSecurityLayers, clearSecurity } from '../../actions/security';

describe('Test the mediaEditor reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = mediaEditor(undefined, {type: 'UNKNOWN'}); // TODO: check default
        expect(state).toEqual(DEFAULT_STATE);
    });
    it('ADDING_MEDIA', () => {
        const adding = false;
        let state = mediaEditor({}, setAddingMedia(adding));
        expect(state.saveState.addingMedia).toEqual(adding);
        expect(state.selected).toEqual("");
    });
    it('EDITING_MEDIA', () => {
        const editing = false;
        let state = mediaEditor({}, setEditingMedia(editing));
        expect(state.saveState.addingMedia).toEqual(editing);
        expect(state.saveState.editing).toEqual(editing);
    });
    it('CHOOSE_MEDIA', () => {
        const oState = {};
        let state = mediaEditor(oState, chooseMedia());
        expect(state).toBe(oState);
    });
    it('HIDE', () => {
        let state = mediaEditor({}, hide());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual(DEFAULT_STATE.settings);
        expect(state.selected).toEqual(undefined);
        expect(state.saveState).toEqual({editing: false, addingMedia: false});
        expect(state.stashedSettings).toEqual(undefined);

        // if there is a stashed change
        state = mediaEditor({stashedSettings: {setting1: true}}, hide());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual({setting1: true});
        expect(state.stashedSettings).toEqual(undefined);
    });
    it('LOAD_MEDIA_SUCCESS', () => {
        const mediaType = "image";
        const sourceId = "id";
        const params = "params";
        const resultData = {};
        let state = mediaEditor({}, loadMediaSuccess({mediaType, sourceId, params, resultData}));
        expect(state.data[mediaType][sourceId]).toEqual({ params, resultData });
    });
    it('SELECT_ITEM', () => {
        const id = "id";
        let state = mediaEditor({}, selectItem(id));
        expect(state.selected).toEqual(id);
    });
    it('SELECT_ITEM with empty the same id', () => {
        const id = "id";
        let state = mediaEditor({selected: id}, selectItem(id));
        expect(state.selected).toEqual('');
    });
    it('SET_MEDIA_SERVICE', () => {
        const value = "id";
        let state = mediaEditor({}, setMediaService({value}));
        expect(state.settings.sourceId).toEqual(value);
    });
    it('SET_MEDIA_TYPE', () => {
        const mediaType = "mediaType";
        let state = mediaEditor({}, setMediaType(mediaType));
        expect(state.settings.mediaType).toEqual(mediaType);
        expect(state.settings.sourceId).toEqual("geostory");

        state = mediaEditor({
            settings: {
                mediaTypes: {
                    mediaType: {
                        defaultSource: "default"
                    }
                }
            }
        }, setMediaType(mediaType));
        expect(state.settings.mediaType).toEqual(mediaType);
        expect(state.settings.sourceId).toEqual("default");
    });
    it('SHOW', () => {
        const owner = "owner";
        const open = true;
        let state = mediaEditor({}, show(owner));
        expect(state.open).toEqual(open);
        expect(state.owner).toEqual(owner);
    });
    it('UPDATE_ITEM', () => {
        const map = {
            id: "resId",
            layers: [{id: "layerId"}]
        };

        let state = mediaEditor({
            settings: {
                mediaType: "map",
                sourceId: "geostoreMap"
            },
            data: {
                map: {
                    geostoreMap: {
                        resultData: {
                            resources: [{
                                id: "resId"
                            }]
                        }
                    }
                }
            }
        }, updateItem(map));
        expect(state.data.map.geostoreMap.resultData.resources[0]).toEqual(map);
    });
    it("LOCATION_CHANGE", () => {
        const adding = true;
        let state = mediaEditor(undefined, setAddingMedia(adding));
        expect(state.saveState.addingMedia).toEqual(adding);
        expect(state.selected).toEqual("");
        expect(state).toNotEqual(DEFAULT_STATE);
        state = mediaEditor(state, {type: LOCATION_CHANGE});
        expect(state).toEqual(DEFAULT_STATE);
    });
    it('should keep the current custom settings on LOCATION_CHANGE', () => {
        const mediaEditorSettings = {
            sourceId: 'geostory',
            mediaTypes: {
                image: {
                    defaultSource: 'geostory',
                    sources: ['geostory']
                },
                video: {
                    defaultSource: 'geostory',
                    sources: ['geostory']
                },
                map: {
                    defaultSource: 'geostory',
                    sources: ['geostory']
                }
            },
            sources: {
                geostory: {
                    name: 'Current story',
                    type: 'geostory'
                }
            }
        };
        let state = mediaEditor(undefined, show('owner', mediaEditorSettings));
        expect(state.settings.mediaTypes).toEqual(mediaEditorSettings.mediaTypes);
        expect(state.settings.sources).toEqual(mediaEditorSettings.sources);
        state = mediaEditor(state, {type: LOCATION_CHANGE});

        const { settings: defaultStateSettings, ...defaultState } = DEFAULT_STATE;
        const { settings: newStateSettings, ...newState } = state;

        expect(newStateSettings.mediaTypes).toEqual(mediaEditorSettings.mediaTypes);
        expect(newStateSettings.sources).toEqual(mediaEditorSettings.sources);

        expect(defaultState).toEqual(newState);
        expect(defaultStateSettings.mediaType).toEqual(newStateSettings.mediaType);
        expect(defaultStateSettings.sourceId).toEqual(newStateSettings.sourceId);
    });
    it('UPDATE_ITEM with mode replace', () => {
        const map = {
            id: "resId",
            layers: [{id: "layerId"}]
        };

        let state = mediaEditor({
            settings: {
                mediaType: "map",
                sourceId: "geostoreMap"
            },
            data: {
                map: {
                    geostoreMap: {
                        resultData: {
                            resources: [{
                                id: "resId",
                                test: "has to disappear"
                            }]
                        }
                    }
                }
            }
        }, updateItem(map, "replace"));
        expect(state.data.map.geostoreMap.resultData.resources[0]).toBe(map);
    });
    it('LOADING_SELECTED_MEDIA', () => {
        const loading = true;
        const state = mediaEditor({}, loadingSelectedMedia(loading));
        expect(state).toEqual({
            loadingSelected: true
        });
    });
    it('LOADING_MEDIA_LIST', () => {
        const state = mediaEditor({}, loadingMediaList());
        expect(state).toEqual({
            loadingList: true
        });
    });
    it('MEDIA_TYPE_DISABLE', () => {
        const state = mediaEditor({}, disableMediaType(['image']));
        expect(state).toEqual({
            disabledMediaType: ['image']
        });
    });
    it('REFRESH_SECURITY_LAYERS', () => {
        const state = mediaEditor({
            settings: {
                mediaType: "map",
                sourceId: "geostoreMap"
            },
            selected: "selected",
            data: {
                map: {
                    geostoreMap: {
                        resultData: {
                            resources: [{
                                id: "selected",
                                data: {
                                    layers: [{
                                        security: {}
                                    }]
                                }
                            }]
                        }
                    }
                }
            }
        }, refreshSecurityLayers());
        expect(state.data.map.geostoreMap.resultData.resources[0].data.layers[0].security.rand).toBeTruthy();
    });
    it('CLEAR_SECURITY', () => {
        const state = mediaEditor({
            settings: {
                mediaType: "map",
                sourceId: "geostoreMap"
            },
            selected: "selected",
            data: {
                map: {
                    geostoreMap: {
                        resultData: {
                            resources: [{
                                id: "selected",
                                data: {
                                    layers: [{
                                        security: {}
                                    }]
                                }
                            }]
                        }
                    }
                }
            }
        }, clearSecurity());
        expect(state.data.map.geostoreMap.resultData.resources[0].data.layers[0].security).toEqual(undefined);
    });
});

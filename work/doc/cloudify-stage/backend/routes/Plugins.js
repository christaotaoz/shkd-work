const express = require('express');

const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const upload = multer();

const _ = require('lodash');

const request = require('request').defaults({ encoding: null });
const archiver = require('archiver');
const ManagerHandler = require('../handler/ManagerHandler');
const RequestHandler = require('../handler/RequestHandler');

const logger = require('../handler/LoggerHandler').getLogger('Plugins');

function checkParams(req, res, next) {
    const noWagon = req.files && _.isEmpty(req.files.wagon_file) && !req.query.wagonUrl;
    const noYaml = req.files && _.isEmpty(req.files.yaml_file) && !req.query.yamlUrl;

    if (noWagon) {
        var errorMessage = 'Must provide a wagon file or url.';
        logger.error(errorMessage);
        res.status(500).send({ message: errorMessage });
    } else if (noYaml) {
        var errorMessage = 'Must provide a yaml file or url.';
        logger.error(errorMessage);
        res.status(500).send({ message: errorMessage });
    } else {
        next();
    }
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (err, res, body) => {
            if (err) {
                logger.error(`Failed downloading ${url}. ${err}`);
                reject(err);
            }
            logger.info(`Finished downloading ${url}`);
            resolve(body);
        });
    });
}

function zipFiles(wagonFile, wagonFilename, yamlFile, output) {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip');
        archive.append(wagonFile, { name: wagonFilename });
        archive.append(yamlFile, { name: 'plugin.yaml' });

        archive.on('error', err => {
            logger.error(`Failed archiving plugin. ${err}`);
            reject(err);
        });

        archive.on('end', () => {
            logger.info('Finished archiving plugin');
            resolve();
        });

        archive.pipe(output);
        archive.finalize();
    });
}

router.post(
    '/upload',
    passport.authenticate('token', { session: false }),
    upload.fields([{ name: 'wagon_file', maxCount: 1 }, { name: 'yaml_file', maxCount: 1 }]),
    checkParams,
    function(req, res, next) {
        const promises = [];
        let wagonFilename;

        if (req.query.wagonUrl) {
            promises.push(downloadFile(req.query.wagonUrl));
            wagonFilename = _.last(req.query.wagonUrl.split('/'));
        } else {
            promises.push(Promise.resolve(req.files.wagon_file[0].buffer));
            wagonFilename = req.files.wagon_file[0].originalname;
        }

        if (req.query.yamlUrl) {
            promises.push(downloadFile(req.query.yamlUrl));
        } else {
            promises.push(Promise.resolve(req.files.yaml_file[0].buffer));
        }

        Promise.all(promises)
            .then(([wagonFile, yamlFile]) => {
                const uploadRequest = ManagerHandler.request(
                    'post',
                    `/plugins?visibility=${req.query.visibility}`,
                    {
                        'authentication-token': req.headers['authentication-token'],
                        tenant: req.headers.tenant
                    },
                    null,
                    response => {
                        RequestHandler.getResponseJson(response)
                            .then(data => {
                                res.status(response.statusCode).send(data);
                            })
                            .catch(() => {
                                res.sendStatus(response.statusCode);
                            });
                    },
                    err => {
                        res.status(500).send({ message: err });
                    }
                );

                zipFiles(wagonFile, wagonFilename, yamlFile, uploadRequest).catch(err => {
                    res.status(500).send({ message: `Failed zipping the plugin. ${err}` });
                });
            })
            .catch(err => {
                res.status(500).send({ message: `Failed downloading files. ${err}` });
            });
    }
);

module.exports = router;

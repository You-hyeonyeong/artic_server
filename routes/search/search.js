var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils')
require('moment-timezone');

// 아카이브 검색
// 아카이브 제목, 스크랩 여부, 아티클 갯수, 카테고리
router.get('/archive', authUtils.isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const keyword = req.query.keyword;
    const getArchivesQuery = "SELECT * FROM artic.archive WHERE archive_title LIKE ?";
    const getScrapCheckQuery = 'SELECT * FROM artic.archiveAdd WHERE user_idx = ? AND archive_idx = ?';
    const getArticleCntQuery = 'SELECT count(article_idx) count FROM archiveArticle WHERE archive_idx = ?';
    const getArchiveCategoryQuery = 'SELECT ca.category_title FROM category ca INNER JOIN archiveCategory ac WHERE ac.archive_idx = ? AND ac.category_idx = ca.category_idx';
    
    const archiveResult = await db.queryParam_Arr(getArchivesQuery, ['%'+keyword+'%']);

    if (archiveResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SEARCH_ARCHIVE_FAIL));
    } else {
        for (var i = 0, archive; archive = archiveResult[i]; i++) {
            const archiveIdx = archive.archive_idx;

            // 아티클 갯수 조회
            const archiveCntResult = await db.queryParam_Arr(getArticleCntQuery, [archiveIdx]);
            if(archiveCntResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_ARTICLE_COUNT_FAIL));
            } else {
                archive.article_cnt = archiveCntResult[0].count;
            }

            // 스크랩 유무 체크
            const scrapCheckResult = await db.queryParam_Arr(getScrapCheckQuery, [userIdx, archiveIdx]);
            if(scrapCheckResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_SCRAP_CHECK_FAIL));
            } else {
                if(scrapCheckResult.length == 0) {
                    archive.scrap = false;
                } else {
                    archive.scrap = true;
                }
            }

            // 아카이브 카테고리 조회
            const archiveCategoryResult = await db.queryParam_Arr(getArchiveCategoryQuery, [archiveIdx]);
            if(archiveCntResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_CATEGORY_FAIL));
            } else {
                archive.category_all = archiveCategoryResult;
            }
            
        }
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SEARCH_ARCHIVE_SUCCESS, archiveResult));
    }
});

// 아카이브 검색
// 아카이브 제목, 스크랩 여부, 아티클 갯수, 카테고리
router.get('/article', authUtils.isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const keyword = req.query.keyword;
    const getArchivesQuery = "SELECT * FROM artic.article WHERE article_title LIKE ?";
    const getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
    const getLikeCheckQuery = 'SELECT * FROM artic.like WHERE user_idx = ? AND article_idx = ?';
    
    const articleListResult = await db.queryParam_Arr(getArchivesQuery, ['%'+keyword+'%']);
        
    if (articleListResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SEARCH_ARTICLE_FAIL));
    } else {
        for (var i = 0, article; article = articleListResult[i]; i++) {
            const articleIdx = article.article_idx;
            const likeCntResult = await db.queryParam_Arr(getLikeCntQuery, [articleIdx]);
            const likeCheckResult = await db.queryParam_Arr(getLikeCheckQuery, [userIdx, articleIdx]);

            if (likeCntResult === undefined || likeCheckResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_LIKE_INFO));
            } else {
                if(likeCheckResult.length == 0) {
                    article.like = false;
                } else {
                    article.like = true;
                }
                article.like_cnt = likeCntResult[0].cnt;
            }
        }
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SEARCH_ARTICLE_SUCCESS, articleListResult));
    }
});

module.exports = router;
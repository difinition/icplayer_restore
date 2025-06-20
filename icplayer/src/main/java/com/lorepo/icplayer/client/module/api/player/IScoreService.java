package com.lorepo.icplayer.client.module.api.player;

import java.util.HashMap;

import com.lorepo.icplayer.client.model.Content.ScoreType;
import com.lorepo.icplayer.client.module.api.player.PageOpenActivitiesScore.ScoreInfo;

public interface IScoreService {

	public int getScore(String moduleName);
	public PageScore getPageScore(String pageName);
	public PageScore getPageScoreById(String pageId);
	public PageScore getPageScoreByName(String pageName);
	public PageScore getPageScoreWithoutOpenActivitiesById(String pageID);
	public void	setScore(String moduleName, int score, int maxScore);
	int getTotalMaxScore();
	int getTotalScore();
	String getAsString();
	void loadFromString(String state);
	void setPageScore(IPage page, PageScore score);
	public ScoreType getScoreType();
	void lessonScoreReset(boolean resetChecks, boolean resetMistakes);
	void setOpenActivitiesScores(HashMap<String, PageOpenActivitiesScore> scores);
	ScoreInfo getOpenActivityScores(String pageID, String moduleID);
	
	//::: Restored by DF: 커스텀 변경 ::: 인수 3개에서 인수4개로 업데이트 됨 
	//void updateOpenActivityScore(String pageID, String moduleID, String aiGrade);
	void updateOpenActivityScore(String pageID, String moduleID, String aiGrade, String aiRelevance);
	
	int getPageScoreWithOnlyActiveOpenActivitiesById(String pageID);
	void ensureOpenActivityScoreExist(String pageID, String moduleID, Integer maxScore);
	
	//::: Restored by DF: 커스텀 추가 ::: ▼▼▼ 
	void setTextGroupID(String module, String groupID);
	HashMap<String, String> getTextGroupID();
	void setGroupTexts(String module, String text);
	HashMap<String, HashMap<String, String>> getGroupTexts();
	//::: Restored by DF: 커스텀 추가 ::: ▲▲▲	
}

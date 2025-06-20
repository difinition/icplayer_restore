package com.lorepo.icplayer.client.module.api.player;

import java.util.HashMap;

import com.google.gwt.core.client.JavaScriptObject;


/**
 * Contains information about page's modules with open activities scores
 */
public class PageOpenActivitiesScore {
	
	public static class ScoreInfo {
		Integer manualGradedScore;
		Integer maxScore;
		Integer aiGradedScore;
		Float aiRelevance;
		
		public ScoreInfo(Integer aiGradedScore, Integer manualGradedScore, Integer maxScore, Float aiRelevance) {
			this.manualGradedScore = manualGradedScore;
			this.aiGradedScore = aiGradedScore;
			this.aiRelevance = aiRelevance;
			this.maxScore = maxScore;
		}

		public ScoreInfo() {}
		
		public void setAIData(Integer aiGradedScore, Float aiRelevance) {
			this.aiGradedScore = aiGradedScore;
			this.aiRelevance = aiRelevance;
		}
		
		public int getScore() {
			if (manualGradedScore != null) {
				return manualGradedScore.intValue();
			}
			if (aiGradedScore != null) {
				return aiGradedScore.intValue();
			}
			return getMaxScore();
		}
		
		public int getMaxScore() {
			if (maxScore != null) {
				return maxScore.intValue();
			}
			return 0;
		}
		
		public Float getAIRelevance() {
			return aiRelevance;
		}
		
		public JavaScriptObject getAsJSObject() {
			int _aiGradedScore = (aiGradedScore != null) ? aiGradedScore.intValue() : -999;
			int _manualGradedScore = (manualGradedScore != null) ? manualGradedScore.intValue() : -999;
			float _aiRelevance = (aiRelevance != null) ? aiRelevance.floatValue() : -999.0f;
			int _maxScore = (maxScore != null) ? maxScore.intValue() : -999;
			return createJSObject(_aiGradedScore, _manualGradedScore, _aiRelevance, _maxScore);
		}
		
		private native JavaScriptObject createJSObject(int aiGradedScore, int manualGradedScore, float aiRelevance, int maxScore) /*-{
			return {
				"manualGradedScore": manualGradedScore === -999 ? null : manualGradedScore,
				"aiGradedScore": aiGradedScore === -999 ? null : aiGradedScore,
				"aiRelevance": aiRelevance === -999 ? null : aiRelevance,
				"maxScore": maxScore === -999 ? null : maxScore
			}
		}-*/;
	}
	
	private HashMap<String, ScoreInfo> scores;
	
	public PageOpenActivitiesScore() {
		this.scores = new HashMap<String, ScoreInfo>();
	}
	
	public ScoreInfo get(String moduleID) {
		return scores.get(moduleID);
	}

	public void addScore(String moduleID, Integer aiGradedScore, Integer manualGradedScore, Integer maxScore, Float aiRelevance) {
		scores.put(moduleID, new ScoreInfo(aiGradedScore, manualGradedScore, maxScore, aiRelevance));
	}
	
	public void setAIData(String moduleID, Integer aiGradedScore, Float aiRelevance) {
		ScoreInfo score = get(moduleID);
		score.setAIData(aiGradedScore, aiRelevance);
	}

	//::: Restored by DF: 커스텀 추가  ::: setAIGradedScore(String moduleID, int aiGradedScore) 메소드 추가됨
	public void setAIGradedScore(String moduleID, int aiGradedScore) {
		ScoreInfo score = this.get(moduleID);
		score.aiGradedScore = aiGradedScore;
	}

	//::: Restored by DF: 커스텀 추가  ::: hasScore(String moduleID) 메소드 추가됨
	public boolean hasScore(String moduleID) {
		return this.scores.containsKey(moduleID);
	}	

	public int getScore(){
		int result = 0;
		for (ScoreInfo scoreInfo : scores.values()) {
			result += scoreInfo.getScore();
		}
		return result;
	}
	
	public int getMaxScore(){
		int result = 0;
		for (ScoreInfo scoreInfo : scores.values()) {
			result += scoreInfo.getMaxScore();
		}
		return result;
	}
}

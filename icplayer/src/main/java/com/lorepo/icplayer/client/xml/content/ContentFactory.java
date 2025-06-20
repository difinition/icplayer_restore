package com.lorepo.icplayer.client.xml.content;

import java.util.ArrayList;

import com.google.gwt.xml.client.Element;
import com.google.gwt.http.client.Request;
import com.google.gwt.http.client.RequestCallback;
import com.google.gwt.http.client.Response;
import com.google.gwt.xml.client.XMLParser;
import com.lorepo.icf.utils.XMLUtils;
import com.lorepo.icplayer.client.model.Content;
import com.lorepo.icplayer.client.utils.Utils;
import com.lorepo.icplayer.client.xml.IProducingLoadingListener;
import com.lorepo.icplayer.client.xml.IXMLFactory;
import com.lorepo.icplayer.client.xml.RequestFinishedCallback;
import com.lorepo.icplayer.client.xml.XMLVersionAwareFactory;
import com.lorepo.icplayer.client.xml.content.parsers.ContentParser_v0;
import com.lorepo.icplayer.client.xml.content.parsers.ContentParser_v1;
import com.lorepo.icplayer.client.xml.content.parsers.ContentParser_v2;
import com.lorepo.icplayer.client.xml.content.parsers.ContentParser_v3;
import com.lorepo.icplayer.client.xml.content.parsers.ContentParser_v4;
import com.lorepo.icplayer.client.xml.content.parsers.IContentParser;

public class ContentFactory extends XMLVersionAwareFactory {
	private ArrayList<Integer> pagesSubset;
	
	protected ContentFactory(ArrayList<Integer> pagesSubset) {
        Utils.consoleLog("::: ContentFactory ContentFactory Start 생성자 ::: ");
		this.setPagesSubset(pagesSubset);
		this.addParser(new ContentParser_v0());
		this.addParser(new ContentParser_v1());
		this.addParser(new ContentParser_v2());
		this.addParser(new ContentParser_v3());
		this.addParser(new ContentParser_v4());
	}
	
	public void setPagesSubset(ArrayList<Integer> pagesSubset) {
        Utils.consoleLog("::: ContentFactory setPagesSubset Start  ::: ");
		this.pagesSubset = pagesSubset;
	}
	
	private void addParser(IContentParser parser) {
		Utils.consoleLog("::: ContentFactory addParser Start  ::: ");
		parser.setPagesSubset(this.pagesSubset);
		super.addParser(parser);
	}

	public static IXMLFactory getInstance(ArrayList<Integer> pagesSubset) {
		Utils.consoleLog("::: ContentFactory getInstance Start  ::: ");
		return new ContentFactory(pagesSubset);
	}
	
	public static IXMLFactory getInstanceWithAllPages() {
		Utils.consoleLog("::: ContentFactory getInstanceWithAllPages Start  ::: ");
		return ContentFactory.getInstance(new ArrayList<Integer>());
	}
	
	@Override
	protected RequestFinishedCallback getContentLoadCallback(final IProducingLoadingListener listener) {
		return new RequestFinishedCallback() {
			@Override
			public void onResponseReceived(String fetchURL, Request request, Response response) {
				Utils.consoleLog("::: ContentFactory getContentLoadCallback onResponseReceived Start  ::: ");
				if (response.getStatusCode() == 200 || response.getStatusCode() == 0) {
					Content content = produce(response.getText(), fetchURL);
					listener.onFinishedLoading(content);
				} else {
					// Handle the error.  Can get the status text from response.getStatusText()
					listener.onError("Wrong status: " + response.getText());
				}
			}
			
			@Override
			public void onError(Request request, Throwable exception) {
				listener.onFinishedLoading(null);
			}
		};
	}

	@Override
	public Content produce(String xmlString, String fetchUrl) {
		Utils.consoleLog("::: ContentFactory produce Start  ::: ");
		Utils.consoleLog("::: ContentFactory produce 01 fetchUrl["+fetchUrl+"]  ::: ");
		
		Element xml = XMLParser.parse(xmlString).getDocumentElement();
		String version = XMLUtils.getAttributeAsString(xml, "version", "1");
		
		Utils.consoleLog("::: ContentFactory produce 02 version["+version+"]  ::: ");
		
		Content producedContent = (Content) this.parsersMap.get(version).parse(xml);
		producedContent.setBaseUrl(fetchUrl);
		
		return producedContent;
	}
}

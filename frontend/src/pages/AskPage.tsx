import { useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const ask = () => {
    if (question.trim()) {
      setMessages((prev) => [...prev, question]);
      setQuestion("");
    }
  };

  return (
    <div className="content ask-content">
      <div className="chat-layout">
        <Card className="chat-history">
          <div className="panel-heading">
            <div>
              <span>CONVERSATIONS</span>
              <strong>CASE-001</strong>
            </div>
            <button className="icon-button" aria-label="New thread">
              <Icon name="plus" />
            </button>
          </div>
          <button className="history-item active">
            <Icon name="chat" />
            <span>
              <strong>Collision sequence analysis</strong>
              <small>Updated just now</small>
            </span>
          </button>
          <button className="history-item">
            <Icon name="chat" />
            <span>
              <strong>Witness signal inconsistencies</strong>
              <small>Yesterday</small>
            </span>
          </button>
          <button className="history-item">
            <Icon name="chat" />
            <span>
              <strong>Vehicle speed estimates</strong>
              <small>Jan 15</small>
            </span>
          </button>
          <div className="grounding-status">
            <div>
              <Icon name="check" />
            </div>
            <strong>Evidence grounding active</strong>
            <span>18 source files indexed</span>
          </div>
        </Card>

        <Card className="chat-main">
          <div className="chat-top">
            <div>
              <div className="nexus-avatar">
                <Icon name="spark" />
              </div>
              <div>
                <strong>NEXUS</strong>
                <span>
                  <i /> Evidence-grounded assistant
                </span>
              </div>
            </div>
            <Button icon="more" variant="ghost">
              Options
            </Button>
          </div>

          <div className="conversation">
            <div className="user-message">
              <div>AK</div>
              <p>Based on all available evidence, what is the most likely sequence of events leading to the collision?</p>
            </div>

            <div className="assistant-message">
              <div className="nexus-avatar small">
                <Icon name="spark" />
              </div>
              <div className="answer">
                <div className="answer-label">
                  ANALYSIS <Badge tone="green">94% CONFIDENCE</Badge>
                </div>
                <p>Based on synchronized video, audio, and document evidence, the most likely sequence is:</p>
                <ol>
                  <li>
                    <b>Vehicle A approached eastbound</b> on Market Street at an estimated 34 mph, within posted speed limits.
                    <button>[1]</button>
                  </li>
                  <li>
                    <b>Vehicle B initiated a left turn</b> across Vehicle A’s path at 18:42:13, approximately four seconds before impact.
                    <button>[2]</button>
                  </li>
                  <li>
                    Frame analysis indicates the traffic signal changed after Vehicle A crossed the stop line, conflicting with witness statement.
                    <button>[3]</button>
                  </li>
                  <li>
                    Vehicle A decelerated approximately 1.3 seconds before impact.
                    <button>[4]</button>
                  </li>
                </ol>
                <div className="analysis-conclusion">
                  <Icon name="spark" />
                  <p>
                    <strong>Assessment:</strong> Available evidence primarily supports Vehicle B initiating a turn across Vehicle A’s path. This finding is corroborated across 4 independent sources.
                  </p>
                </div>
                <div className="citations">
                  <span>SOURCES</span>
                  <button>
                    <b>1</b>CCTV_intersection.mp4 <i>01:58–02:43</i>
                  </button>
                  <button>
                    <b>2</b>police_report.pdf <i>p. 4–5</i>
                  </button>
                  <button>
                    <b>3</b>witness_statement.wav <i>02:16</i>
                  </button>
                  <button>
                    <b>4</b>vehicle_damage_01.jpg <i>Visual analysis</i>
                  </button>
                </div>
                <div className="answer-actions">
                  <div>
                    <Button icon="check">Helpful</Button>
                    <Button variant="ghost">Not helpful</Button>
                  </div>
                  <Button icon="report">Add to report</Button>
                </div>
              </div>
            </div>

            {messages.map((msg, i) => (
              <div className="user-message" key={i}>
                <div>AK</div>
                <p>{msg}</p>
              </div>
            ))}
          </div>

          <div className="chat-composer">
            <div className="suggestions">
              <button onClick={() => setQuestion("What evidence contradicts this conclusion?")}>
                What evidence contradicts this?
              </button>
              <button onClick={() => setQuestion("Compare both witness accounts")}>
                Compare witness accounts
              </button>
              <button onClick={() => setQuestion("Show confidence methodology")}>
                Show confidence methodology
              </button>
            </div>
            <div className="composer-box">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this investigation…"
              />
              <div>
                <span>
                  <Icon name="link" /> Responses cite source evidence
                </span>
                <button onClick={ask} aria-label="Send query">
                  <Icon name="send" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

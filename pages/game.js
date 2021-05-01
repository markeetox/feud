import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Title from '../components/title'
import Round from '../components/round'
import Final from '../components/final'
import "tailwindcss/tailwind.css";

let timerInterval = null

export default function Game(props){
  const { i18n, t } = useTranslation();
  const [game, setGame] = useState({})
  const [timer, setTimer] = useState(0)
  useEffect(() => {
    var ws = new WebSocket(`ws://${ window.location.hostname }:8080`);
    ws.onopen = function() {
      console.log("game connected to server");
    };

    ws.onmessage = function (evt) { 
      var received_msg = evt.data;
      let json = JSON.parse(received_msg)
      if(json.action === "data"){
        if(json.data.title_text === "Change Me"){
          json.data.title_text = t("changeMe")
        }
        if(json.data.teams[0].name === "Team 1"){
          json.data.teams[0].name = `${ t("team") } ${t("number",{count:1})}`
        }
        if(json.data.teams[1].name === "Team 2"){
          json.data.teams[1].name = `${ t("team") } ${t("number",{count:2})}`
        }
        setGame(json.data)
      } else if(json.action === "mistake"){
        var audio = new Audio('wrong.mp3');
        audio.play();
      } else if(json.action === "reveal"){
        var audio = new Audio('good-answer.mp3');
        audio.play();
      }else if(json.action === "final_reveal"){
        var audio = new Audio('fm-answer-reveal.mp3');
        audio.play();
      }else if(json.action === "final_submit"){
        var audio = new Audio('good-answer.mp3');
        audio.play();
      }else if(json.action === "final_wrong"){
        var audio = new Audio('try-again.mp3');
        audio.play();
      }else if(json.action === "set_timer"){
        setTimer(json.data)
      }else if(json.action === "stop_timer"){
        clearInterval(timerInterval)
      }else if(json.action === "start_timer"){
        let limit = json.data
        timerInterval = setInterval(() => {
          if(limit > 0){
            limit = limit -1
            setTimer(limit)
          }else{
            var audio = new Audio('try-again.mp3');
            audio.play();
            clearInterval(timerInterval)
            setTimer(json.data)
          }
        }, 1000)

      }else if (json.action === "change_lang"){
        console.debug("Language Change", json.data)
        i18n.changeLanguage(json.data)
      }
      else{
        console.error("didn't expect", json)
      }

    };
  }, [])

  if(game.teams != null){
   
  let gameSession
  if(game.title){
    gameSession = <Title game={game}/>
  } else if (game.is_final_round){
    gameSession = <Final game={game} timer={timer}/>
  }else{
    gameSession = <Round game={game}/>
  }

  return (
    <div>
      {gameSession}
    </div>
  )
  }else{
    return(
      <div>
        <p>{t("loading")}</p>
      </div>
    )
  }
}

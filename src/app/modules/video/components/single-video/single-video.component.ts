import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ImageSlider, ImageSliderImage } from '../../../../directives/image-slider/interface/image-slider.interface';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { VideoService } from '../../services/video.service';
import * as screenfull from 'screenfull'
import { VideoModel } from '../../../../models/video.model';
import { VideoSource } from '../../../../enums/videosource.enum';

@Component({
  selector: 'app-single-video',
  templateUrl: './single-video.component.html',
  styleUrls: ['./single-video.component.css'],
  providers: [VideoService]
})
export class SingleVideoComponent implements OnInit {

  @ViewChild('videoPlayer', { read: ElementRef }) videoPlayerControlRef: ElementRef;
  videoPlayer: HTMLMediaElement;
  videoTimer: any;
  @ViewChild('seekBar', { read: ElementRef }) seekBarControlRef: ElementRef;
  seekBar: HTMLDivElement;
  videoCurrentTime: string | number = '00:00:00';
  videoTotalTime: string | number = '00:00:00';

  seekBarPercent: number = 0;

  currentVideo: VideoModel = new VideoModel();

  isAdPlayed: boolean = false;
  isAdvideoPlaying: boolean = false;
  adVideos: string[] = [
    '/assets/videodata/ads/ad1.mp4',
    '/assets/videodata/ads/ad2.mp4',
    '/assets/videodata/ads/ad3.mp4',
  ]


  relatedVideoSliderImages: ImageSlider = {
    ImageSlideList: []
  };

  constructor(private _videoService: VideoService, private _activatedRoute: ActivatedRoute) {
    this._videoService.getAllVideos().then(allVideos => {

      this.relatedVideoSliderImages.ImageSlideList = allVideos.map(singleVideo => {
        let singleImage: ImageSliderImage = {
          href: 'video/play/' + singleVideo.id,
          imagePath: singleVideo.thumbnails.medium,
          metaData: [
            { faClassName: 'fa-eye', text: singleVideo.viewsCount.toString() },
            { faClassName: 'fa-thumbs-up', text: singleVideo.likesCount.toString() },
            { faClassName: 'fa-thumbs-down', text: singleVideo.dislikesCount.toString() },
          ],
          title: singleVideo.title
        };
        return singleImage;
      });


    });
  }

  ngOnInit() {

    this.seekBar = <HTMLDivElement>this.seekBarControlRef.nativeElement;
    this.videoPlayer = <HTMLMediaElement>this.videoPlayerControlRef.nativeElement;


    window.scroll({ top: 180, behavior: 'smooth' });

    this._activatedRoute.params.subscribe((params) => {
      let videoId = params['id'];
      this._videoService.getVideoById(videoId).then(vid => {

        this.currentVideo = vid;

        this.videoPlayer.src = '';
        this.isAdPlayed = false;

        this.setVideoData();
      });
    })
  }

  public videoEnded() {
    if (!this.isAdPlayed) {
      this.isAdvideoPlaying = false;
      this.isAdPlayed = true;
      this.videoPlayer.src = this.currentVideo.src;
      this.videoPlayer.load();
      this.videoPlayer.play();
    }
    else {

      this.isAdvideoPlaying = false;
      this.isAdPlayed = true;
      this.videoPlayer.load();
    }
  }

  public contextMenu(ev: MouseEvent) {
    ev.preventDefault();
  }


  public onTimeUpdate() {
    this.seekBarPercent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100;
    this.videoCurrentTime = this.secToTime(this.videoPlayer.currentTime);
    this.videoTotalTime = this.secToTime(this.videoPlayer.duration);
  }

  private setVideoData() {
    if (this.currentVideo.videoSource == VideoSource.File) {
      this.videoPlayer.src = this.isAdPlayed ? this.currentVideo.src : this.adVideos[(Math.floor(Math.random() * 3) + 0)];
      if (!this.isAdPlayed) {
        this.isAdvideoPlaying = true;
      }
      this.videoPlayer.play().catch(err => {

      });
      this.videoTotalTime = this.currentVideo.duration;

    }
  }

  public seekVideo(ev: MouseEvent) {
    ev.preventDefault();
    if(!this.isAdvideoPlaying){
      this.seekBarPercent = (ev.offsetX / this.seekBar.offsetWidth) * 100;
      this.videoPlayer.currentTime = (this.videoPlayer.duration / 100) * this.seekBarPercent;
    }
  }


  public secToTime(duration: number): string | number {
    if (!duration) {
      return '00:00:00';
    }
    let sec_num = parseInt(duration.toString(), 10);
    let hours: string | number = Math.floor(sec_num / 3600);
    let minutes: string | number = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: string | number = sec_num - (hours * 3600) - (minutes * 60);
    console.log('nan duration', duration);


    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    return hours + ":" + minutes + ":" + seconds;

  }

  fullScreen: boolean = false

  public toggleFullScreen() {
    screenfull.toggle(this.videoPlayer);
  }

  public shareVideo() {

    if (navigator['share']) {
      navigator['share']({
        title: 'Thor',
        text: 'Thor moview',
        url: location.href,
      });
    }
  }

  public play() {
    this.videoPlayer.play();
  }

  public pause() {
    this.videoPlayer.pause();
  }

  public onVideoWaiting(ev){
    
  }

}
